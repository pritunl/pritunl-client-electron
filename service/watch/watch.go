package watch

import (
	"fmt"
	"reflect"
	"runtime"
	"runtime/debug"
	"strings"
	"sync"
	"time"

	"github.com/pritunl/pritunl-client-electron/service/config"
	"github.com/pritunl/pritunl-client-electron/service/event"
	"github.com/pritunl/pritunl-client-electron/service/profile"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"github.com/sirupsen/logrus"
)

var (
	lastRestart    = time.Now()
	lastDnsRefresh = time.Now()
	restartLock    = sync.Mutex{}
)

type ConnState struct {
	Id        string
	Domains   []string
	Addresses []string
}

func parseDns(data string) (searchDomains, searchAddresses []string) {
	dataSpl := strings.Split(data, "\n")
	key := ""
	searchDomains = []string{}
	searchAddresses = []string{}

	if len(dataSpl) < 2 {
		return
	}

	for _, line := range dataSpl[1 : len(dataSpl)-1] {
		if key == "" {
			if strings.Contains(line, "<array>") {
				key = strings.TrimSpace(strings.SplitN(line, ":", 2)[0])
				if key == "Pritunl" {
					key = ""
					continue
				}
			}
		} else {
			line = strings.TrimSpace(line)

			if strings.HasPrefix(line, "}") {
				key = ""
			} else {
				lineSpl := strings.SplitN(line, ":", 2)
				if len(lineSpl) > 1 {
					val := strings.TrimSpace(lineSpl[1])

					switch key {
					case "SearchDomains":
						searchDomains = append(searchDomains, val)
					case "ServerAddresses":
						if !strings.Contains(val, ":") {
							searchAddresses = append(searchAddresses, val)
						}
					}
				}
			}
		}
	}

	return
}

func wakeWatch() {
	defer func() {
		panc := recover()
		if panc != nil {
			logrus.WithFields(logrus.Fields{
				"stack": string(debug.Stack()),
				"panic": panc,
			}).Error("watch: Panic")
			panic(panc)
		}
	}()

	curTime := time.Now()
	update := false

	for {
		if !profile.GetActive() {
			if update {
				status := profile.GetStatus()

				if status {
					evt := event.Event{
						Type: "connected",
					}
					evt.Init()
				} else {
					evt := event.Event{
						Type: "disconnected",
					}
					evt.Init()
				}
			}

			time.Sleep(30 * time.Second)
			curTime = time.Now()
			continue
		} else {
			update = true
		}

		time.Sleep(1 * time.Second)
		if utils.SinceAbs(curTime) > 30*time.Second {
			restartLock.Lock()
			if utils.SinceAbs(lastRestart) > 60*time.Second {
				lastRestart = time.Now()
				restartLock.Unlock()

				logrus.Warn("watch: Wakeup restarting...")

				profile.RestartProfiles(false)
			} else {
				restartLock.Unlock()
			}
		}
		curTime = time.Now()
	}
}

func dnsWatch() {
	defer func() {
		panc := recover()
		if panc != nil {
			logrus.WithFields(logrus.Fields{
				"stack": string(debug.Stack()),
				"panic": panc,
			}).Error("watch: Panic")
			panic(panc)
		}
	}()

	if runtime.GOOS != "darwin" {
		return
	}

	check := true
	errorCount := 0

	for {
		time.Sleep(2 * time.Second)

		if !profile.GetStatus() {
			if check {
				if profile.DnsForced {
					utils.ClearDns()
				}

				err := utils.RestoreScutilDns()
				if err != nil {
					errorCount += 1

					if errorCount >= 2 {
						logrus.WithFields(logrus.Fields{
							"error": err,
						}).Error("watch: Failed to restore DNS, " +
							"resetting network")

						utils.ResetNetworking()
						check = false
						errorCount = 0

						time.Sleep(5 * time.Second)
					} else {
						logrus.WithFields(logrus.Fields{
							"error": err,
						}).Warn("watch: Failed to restore DNS")
					}
				} else {
					check = false
					errorCount = 0
				}
			}

			time.Sleep(3 * time.Second)

			continue
		}

		time.Sleep(2 * time.Second)

		check = true
		errorCount = 0
		global, _ := utils.GetScutilKey("State", "/Network/Global/DNS")

		if strings.Contains(global, "No such key") {
			continue
		}

		connIds, err := utils.GetScutilConnIds()
		if err != nil {
			utils.ClearDNSCacheFast()
			logrus.WithFields(logrus.Fields{
				"error": err,
			}).Error("watch: Failed to get DNS connection IDs")
			continue
		}

		connStates := []*ConnState{}
		for _, connId := range connIds {
			connKey := fmt.Sprintf("/Network/Pritunl/Connection/%s", connId)

			connState, err := utils.GetScutilKey("State", connKey)
			if err != nil {
				logrus.WithFields(logrus.Fields{
					"connection_key": connKey,
					"error":          err,
				}).Error("watch: Failed to read connection DNS key")

			}

			connDomains, connAddresses := parseDns(connState)

			connStates = append(connStates, &ConnState{
				Id:        connId,
				Domains:   connDomains,
				Addresses: connAddresses,
			})
		}

		globalDomains, globalAddresses := parseDns(global)

		matchConnId := ""
		for _, connState := range connStates {
			connAddresses := connState.Addresses

			if reflect.DeepEqual(connAddresses, globalAddresses) {
				matchConnId = connState.Id
				break
			}
		}

		if matchConnId == "" {
			logrus.WithFields(logrus.Fields{
				"global_domains":   globalDomains,
				"global_addresses": globalAddresses,
			}).Warn("watch: Lost DNS settings updating...")

			restartLock.Lock()

			err = utils.BackupScutilDns()
			if err != nil {
				logrus.WithFields(logrus.Fields{
					"error": err,
				}).Error("watch: Failed to backup DNS settings")
			}

			err = utils.RestoreScutilDns()
			if err != nil {
				logrus.WithFields(logrus.Fields{
					"error": err,
				}).Error("watch: Failed to restore DNS settings")
			}

			restartLock.Unlock()
		} else if utils.SinceAbs(lastDnsRefresh) >= 30*time.Second && !config.Config.DisableDnsRefresh {

			lastDnsRefresh = time.Now()

			err = utils.RefreshScutilDns()
			if err != nil {
				logrus.WithFields(logrus.Fields{
					"error": err,
				}).Error("watch: Failed to refresh DNS settings")
				utils.ClearDNSCacheFast()
			}

			continue
		}
	}
}

func StartWatch() {
	if config.Config.DisableWakeWatch {
		logrus.Info("watch: Wake watch disabled")
	} else {
		go wakeWatch()
	}
	if config.Config.DisableDnsWatch {
		logrus.Info("watch: DNS watch disabled")
	} else {
		go dnsWatch()
	}
}

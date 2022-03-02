package watch

import (
	"fmt"
	"reflect"
	"runtime"
	"runtime/debug"
	"strings"
	"sync"
	"time"

	"github.com/pritunl/pritunl-client-electron/service/profile"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"github.com/sirupsen/logrus"
)

var (
	lastRestart = time.Now()
	restartLock = sync.Mutex{}
)

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

	for {
		if !profile.GetActive() {
			time.Sleep(30 * time.Second)
			curTime = time.Now()
			continue
		}

		time.Sleep(1 * time.Second)
		if utils.SinceSafe(curTime) > 30*time.Second {
			restartLock.Lock()
			if utils.SinceSafe(lastRestart) > 60*time.Second {
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

	reset := false
	dnsState := false

	for {
		time.Sleep(2 * time.Second)

		if !profile.GetStatus() {
			if dnsState {
				err := utils.RestoreScutilDns()
				if err != nil {
					logrus.WithFields(logrus.Fields{
						"error": err,
					}).Warn("watch: Failed to restore DNS")
				} else {
					dnsState = false
				}
			}

			time.Sleep(3 * time.Second)

			continue
		}

		vpn, _ := utils.GetScutilKey("State", "/Network/Pritunl/DNS")
		global, _ := utils.GetScutilKey("State", "/Network/Global/DNS")

		if strings.Contains(global, "No such key") {
			continue
		}

		dnsState = true

		if strings.Contains(vpn, "No such key") {
			connIds, err := utils.GetScutilConnIds()
			if err != nil {
				logrus.WithFields(logrus.Fields{
					"error": err,
				}).Error("watch: Failed to get DNS connection IDs")
				continue
			}

			if len(connIds) == 0 {
				continue
			}

			err = utils.CopyScutilKey(
				"State",
				fmt.Sprintf("/Network/Pritunl/Connection/%s", connIds[0]),
				"/Network/Pritunl/DNS",
			)
			if err != nil {
				logrus.WithFields(logrus.Fields{
					"error": err,
				}).Error("watch: Failed to copy DNS settings")
				continue
			}

			continue
		}

		vpnDomains, vpnAddresses := parseDns(vpn)
		globalDomains, globalAddresses := parseDns(global)

		if !reflect.DeepEqual(vpnAddresses, globalAddresses) {
			if reset {
				restartLock.Lock()

				logrus.WithFields(logrus.Fields{
					"vpn_domains":      vpnDomains,
					"vpn_addresses":    vpnAddresses,
					"global_domains":   globalDomains,
					"global_addresses": globalAddresses,
				}).Warn("watch: Lost DNS settings updating...")

				err := utils.BackupScutilDns()
				if err != nil {
					logrus.WithFields(logrus.Fields{
						"error": err,
					}).Error("watch: Failed to backup DNS settings")
				} else {
					err = utils.CopyScutilDns("/Network/Pritunl/DNS")
					if err != nil {
						logrus.WithFields(logrus.Fields{
							"error": err,
						}).Error("watch: Failed to update DNS settings")
					}
				}

				restartLock.Unlock()
				reset = false
			} else {
				reset = true
			}
		} else {
			reset = false
		}
	}
}

func StartWatch() {
	go wakeWatch()
	go dnsWatch()
}

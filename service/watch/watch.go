package watch

import (
	"github.com/Sirupsen/logrus"
	"github.com/pritunl/pritunl-client-electron/service/profile"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"reflect"
	"runtime"
	"strings"
	"sync"
	"time"
)

var (
	lastRestart = time.Now()
	restartLock = sync.Mutex{}
	wake        = time.Now()
	wakeLock    = sync.Mutex{}
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
			key = strings.TrimSpace(strings.SplitN(line, ":", 2)[0])
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
						searchAddresses = append(searchAddresses, val)
					}
				}
			}
		}
	}

	return
}

func wakeWatch(delay time.Duration) {
	curTime := time.Now()
	delay += 1 * time.Second

	for {
		time.Sleep(delay)
		if time.Since(curTime) > 10*time.Second {
			reset := false

			wakeLock.Lock()
			if time.Since(wake) > 5*time.Second {
				wake = time.Now()
				reset = true
			}
			wakeLock.Unlock()

			if reset {
				restartLock.Lock()
				if time.Since(lastRestart) > 60*time.Second {
					lastRestart = time.Now()
					restartLock.Unlock()

					logrus.Warn("watch: Wakeup restarting...")

					profile.RestartProfiles()
				} else {
					restartLock.Unlock()
				}
			}
		}
		curTime = time.Now()
	}
}

func dnsWatch() {
	if runtime.GOOS != "darwin" {
		return
	}

	reset := false

	for {
		time.Sleep(1 * time.Second)

		if !profile.GetStatus() {
			continue
		}

		vpn, _ := utils.GetScutilKey("/Network/Pritunl/DNS")
		global, _ := utils.GetScutilKey("/Network/Global/DNS")

		if strings.Contains(vpn, "No such key") ||
			strings.Contains(global, "No such key") {
			continue
		}

		vpnDomains, vpnAddresses := parseDns(vpn)
		globalDomains, globalAddresses := parseDns(global)

		if !reflect.DeepEqual(vpnDomains, globalDomains) ||
			!reflect.DeepEqual(vpnAddresses, globalAddresses) {

			if reset {
				restartLock.Lock()

				logrus.WithFields(logrus.Fields{
					"vpn_domains":      vpnDomains,
					"vpn_addresses":    vpnAddresses,
					"global_domains":   globalDomains,
					"global_addresses": globalAddresses,
				}).Warn("watch: Lost DNS settings updating...")

				err := utils.CopyScutilDns()
				if err != nil {
					logrus.WithFields(logrus.Fields{
						"error": err,
					}).Error("watch: Failed to update DNS settings")
				}

				utils.ClearDNSCache()
				go func() {
					time.Sleep(1 * time.Second)
					utils.ClearDNSCache()
				}()

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
	go wakeWatch(10 * time.Millisecond)
	go wakeWatch(100 * time.Millisecond)
	go dnsWatch()
}

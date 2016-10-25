package watch

import (
	"github.com/pritunl/pritunl-client-electron/service/profile"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"runtime"
	"strings"
	"sync"
	"time"
)

var (
	wake     = time.Now()
	wakeLock = sync.Mutex{}
)

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
				profile.ResetProfiles()
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

		openvpn, _ := utils.GetScutilKey("/Network/OpenVPN/DNS")
		global, _ := utils.GetScutilKey("/Network/Global/DNS")

		if strings.Contains(openvpn, "No such key") ||
			strings.Contains(global, "No such key") {
			continue
		}

		if openvpn != global {
			if reset {
				profile.RestartProfiles()
				time.Sleep(60 * time.Second)
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

package watch

import (
	"github.com/pritunl/pritunl-client-electron/service/profile"
	"time"
)

func sleepWatch() {
	curTime := time.Now()

	for {
		time.Sleep(1 * time.Second)
		if time.Since(curTime) > 10*time.Second {
			for _, prfl := range profile.GetProfiles() {
				prfl.Reset()
			}
		}
		curTime = time.Now()
	}
}

func StartWatch() {
	go sleepWatch()
}

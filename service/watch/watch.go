package watch

import (
	"github.com/pritunl/pritunl-client-electron/service/profile"
	"sync"
	"time"
)

var (
	wake     = time.Now()
	wakeLock = sync.Mutex{}
)

func sleepWatch(delay time.Duration) {
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
				for _, prfl := range profile.GetProfiles() {
					prfl.Reset()
				}
			}
		}
		curTime = time.Now()
	}
}

func StartWatch() {
	go sleepWatch(10 * time.Millisecond)
	go sleepWatch(100 * time.Millisecond)
}

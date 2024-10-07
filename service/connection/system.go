package connection

import (
	"runtime/debug"
	"sync"
	"time"

	"github.com/pritunl/pritunl-client-electron/service/event"
	"github.com/pritunl/pritunl-client-electron/service/sprofile"
	"github.com/pritunl/pritunl-client-electron/service/update"
	"github.com/sirupsen/logrus"
)

var (
	sprofileShutown = false
)

func ImportSystemProfile(sPrfl *sprofile.Sprofile) (
	conn *Connection, err error) {

	prfl := &Profile{
		Id: sPrfl.Id,
	}

	prfl.ImportSystemProfile(sPrfl)

	conn, err = NewConnection(prfl)
	if err != nil {
		return
	}

	return
}

func SyncSystemProfiles() (err error) {
	sprfls, err := sprofile.GetAll()
	if err != nil {
		return
	}

	conns := GlobalStore.GetAll()

	update := false
	waiter := sync.WaitGroup{}

	for _, sPrfl := range sprfls {
		conn := conns[sPrfl.Id]

		if sPrfl.State {
			if conn == nil {
				conn, err = ImportSystemProfile(sPrfl)
				if err != nil {
					return
				}

				update = true
				waiter.Add(1)

				go func() {
					ready := conn.Ready()
					if !ready {
						logrus.WithFields(logrus.Fields{
							"profile_id": conn.Id,
						}).Info("profile: Profile not ready, waiting")
					} else {
						conn.Start(Options{})
					}

					waiter.Done()
				}()
			} else if conn.Profile.Mode != sPrfl.LastMode &&
				!(conn.Profile.Mode == "ovpn" && sPrfl.LastMode == "") {

				update = true
				waiter.Add(1)

				go func() {
					conn.Stop()

					conn, err = ImportSystemProfile(sPrfl)
					if err != nil {
						return
					}

					conn.Start(Options{})

					waiter.Done()
				}()
			}
		} else if conn != nil {
			update = true
			waiter.Add(1)

			go func() {
				conn.Stop()
				waiter.Done()
			}()
		}
	}

	waiter.Wait()

	if update {
		evt := event.Event{
			Type: "update",
			Data: &Profile{
				Id: "",
			},
		}
		evt.Init()

		if GlobalStore.IsConnected() {
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

	return
}

func watchSystemProfiles() {
	defer func() {
		panc := recover()
		if panc != nil {
			logrus.WithFields(logrus.Fields{
				"stack": string(debug.Stack()),
				"panic": panc,
			}).Error("profile: Watch system profiles panic")
			time.Sleep(5 * time.Second)
			go watchSystemProfiles()
		}
	}()

	time.Sleep(1 * time.Second)
	sprofile.Reload(true)

	for {
		time.Sleep(2 * time.Second)

		if Shutdown {
			return
		}

		if GlobalStore.Len() == 0 {
			_ = update.Check()
		}

		err := SyncSystemProfiles()
		if err != nil {
			logrus.WithFields(logrus.Fields{
				"error": err,
			}).Error("profile: Failed to sync system profiles")
		}
	}
}

func WatchSystemProfiles() {
	go watchSystemProfiles()
}

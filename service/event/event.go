// Event system for client using web socket.
package event

import (
	"sync"
	"time"

	"github.com/dhurley94/pritunl-client-electron/service/utils"
	"github.com/dropbox/godropbox/container/set"
)

var (
	LastAwake = time.Now()
	listeners = struct {
		sync.RWMutex
		s set.Set
	}{
		s: set.NewSet(),
	}
)

type Event struct {
	Id   string      `json:"id"`
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

func (e *Event) Init() {
	e.Id = utils.Uuid()

	listeners.RLock()
	defer listeners.RUnlock()

	for listInf := range listeners.s.Iter() {
		list := listInf.(*Listener)

		go func() {
			defer func() {
				recover()
			}()
			list.stream <- e
		}()
	}
}

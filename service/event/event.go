package event

import (
	"github.com/dropbox/godropbox/container/set"
	"github.com/pritunl/pritunl-client-electron/service/utils"
)

var (
	listeners = set.NewSet()
)

type Event struct {
	Id   string      `json:"id"`
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

func (e *Event) Init() {
	e.Id = utils.Uuid()
	for listInf := range listeners.Iter() {
		list := listInf.(*Listener)

		go func() {
			defer func() {
				recover()
			}()
			list.stream <- e
		}()
	}
}

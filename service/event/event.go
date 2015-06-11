package event

import (
	"github.com/dropbox/godropbox/container/set"
	"github.com/pritunl/pritunl-client-electron/service/utils"
)

var (
	events = make(chan *Event, 1024)
	listeners = set.NewSet()
)

type Event struct {
	Id   string      `json:"id"`
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

func (e *Event) Init() {
	e.Id = utils.Uuid()
	events <- e
}

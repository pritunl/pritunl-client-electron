package event

var (
	Events = make(chan *Event)
)

type Event struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

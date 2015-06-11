package event

var (
	events = make(chan *Event)
)

type Event struct {
	Id   string      `json:"id"`
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

func (e *Event) Init() {
	events <- e
}

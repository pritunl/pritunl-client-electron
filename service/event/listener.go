package event

type Listener struct {
	stream chan *Event
}

func (l *Listener) Listen() chan *Event {
	listeners.Add(l)
	return l.stream
}

func (l *Listener) Close() {
	close(l.stream)
}

func NewListener() (list *Listener) {
	list = &Listener{}
	list.stream = make(chan *Event)
	return
}

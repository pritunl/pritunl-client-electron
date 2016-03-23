package event

type Listener struct {
	stream chan *Event
}

func (l *Listener) Listen() chan *Event {
	listeners.Lock()
	listeners.s.Add(l)
	listeners.Unlock()
	return l.stream
}

func (l *Listener) Close() {
	listeners.Lock()
	listeners.s.Remove(l)
	listeners.Unlock()
	close(l.stream)
}

func NewListener() (list *Listener) {
	list = &Listener{}
	list.stream = make(chan *Event)
	return
}

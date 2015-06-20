package logger

import (
	"github.com/Sirupsen/logrus"
	"github.com/dropbox/godropbox/errors"
	"os"
	"time"
)

func init() {
	senders = append(senders, &fileSender{})
}

type fileSender struct {
	limit  limiter
	buffer chan *logrus.Entry
}

func (s *fileSender) listen() {
	for {
		entry := <-s.buffer

		err := s.send(entry)
		if err != nil {
			logrus.WithFields(logrus.Fields{
				"error": err,
			}).Error("logger: File send error")
		}
	}
}

func (s *fileSender) Init() {
	s.limit = limiter{}
	s.buffer = make(chan *logrus.Entry, 128)
	go s.listen()
}

func (s *fileSender) Parse(entry *logrus.Entry) {
	if !s.limit.Check(entry, 3*time.Second) {
		return
	}

	if len(s.buffer) <= 125 {
		s.buffer <- entry
	}
}

func (s *fileSender) send(entry *logrus.Entry) (err error) {
	msg, err := entry.String()
	if err != nil {
		return
	}

	file, err := os.OpenFile("pritunl.log",
		os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		err = &WriteError{
			errors.Wrap(err, "logger: Failed to open log file"),
		}
		return
	}
	defer file.Close()

	_, err = file.WriteString(msg)
	if err != nil {
		err = &WriteError{
			errors.Wrap(err, "logger: Failed to write to log file"),
		}
		return
	}

	return
}

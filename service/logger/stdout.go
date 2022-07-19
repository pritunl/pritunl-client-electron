package logger

import (
	"fmt"
	"runtime"

	"github.com/sirupsen/logrus"
)

type stdoutSender struct{}

func (s *stdoutSender) Init() {}

func (s *stdoutSender) Parse(entry *logrus.Entry) {
	err := s.send(entry)
	if err != nil {
		logrus.WithFields(logrus.Fields{
			"error": err,
		}).Error("logger: Stdout send error")
	}
}

func (s *stdoutSender) send(entry *logrus.Entry) (err error) {
	var msg []byte
	if runtime.GOOS == "windows" {
		msg = formatPlain(entry)
	} else {
		msg = format(entry)
	}

	fmt.Print(string(msg))

	return
}

func init() {
	senders = append(senders, &stdoutSender{})
}

package logger

import (
	"github.com/Sirupsen/logrus"
	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"os"
)

func init() {
	senders = append(senders, &fileSender{})
}

type fileSender struct{}

func (s *fileSender) Init() {}

func (s *fileSender) Parse(entry *logrus.Entry) {
	err := s.send(entry)
	if err != nil {
		logrus.WithFields(logrus.Fields{
			"error": err,
		}).Error("logger: File send error")
	}
}

func (s *fileSender) send(entry *logrus.Entry) (err error) {
	msg, err := entry.String()
	if err != nil {
		return
	}

	file, err := os.OpenFile(utils.GetLogPath(),
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

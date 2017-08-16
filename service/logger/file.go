package logger

import (
	"github.com/Sirupsen/logrus"
	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/errortypes"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"os"
)

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
	msg := formatPlain(entry)

	file, err := os.OpenFile(utils.GetLogPath(),
		os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		err = &errortypes.WriteError{
			errors.Wrap(err, "logger: Failed to open log file"),
		}
		return
	}
	defer file.Close()

	stat, err := file.Stat()
	if err != nil {
		err = &errortypes.ReadError{
			errors.Wrap(err, "logger: Failed to stat log file"),
		}
		return
	}

	if stat.Size() >= 2000000 {
		os.Remove(utils.GetLogPath2())
		err = os.Rename(utils.GetLogPath(), utils.GetLogPath2())
		if err != nil {
			err = &errortypes.WriteError{
				errors.Wrap(err, "logger: Failed to rotate log file"),
			}
			return
		}

		file.Close()
		file, err = os.OpenFile(utils.GetLogPath(),
			os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0666)
		if err != nil {
			err = &errortypes.WriteError{
				errors.Wrap(err, "logger: Failed to open log file"),
			}
			return
		}
	}

	_, err = file.Write(msg)
	if err != nil {
		err = &errortypes.WriteError{
			errors.Wrap(err, "logger: Failed to write to log file"),
		}
		return
	}

	return
}

func init() {
	senders = append(senders, &fileSender{})
}

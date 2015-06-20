package logger

import (
	"github.com/Sirupsen/logrus"
)

type logHook struct{}

func (h *logHook) Fire(entry *logrus.Entry) (err error) {
	if len(buffer) <= 125 {
		buffer <- entry
	}

	return
}

func (h *logHook) Levels() []logrus.Level {
	return []logrus.Level{
		logrus.InfoLevel,
		logrus.WarnLevel,
		logrus.ErrorLevel,
		logrus.FatalLevel,
		logrus.PanicLevel,
	}
}

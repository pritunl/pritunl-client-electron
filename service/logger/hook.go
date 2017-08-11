package logger

import (
	"github.com/Sirupsen/logrus"
	"strings"
)

type logHook struct{}

func (h *logHook) Fire(entry *logrus.Entry) (err error) {
	if strings.HasPrefix(entry.Message, "logger:") {
		return
	}

	for _, sndr := range senders {
		sndr.Parse(entry)
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

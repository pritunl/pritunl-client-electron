package logger

import (
	"github.com/Sirupsen/logrus"
)

type logHook struct{}

func (h *logHook) Fire(entry *logrus.Entry) (err error) {
	if len(entry.Message) > 7 && entry.Message[:7] == "logger:" {
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

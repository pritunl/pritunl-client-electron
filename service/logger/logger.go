// Logger system outputs to log file.
package logger

import (
	"github.com/Sirupsen/logrus"
	"os"
	"time"
)

var (
	senders = []sender{}
)

func formatLevel(lvl logrus.Level) string {
	switch lvl {
	case logrus.InfoLevel:
		return "[INFO]"
	case logrus.WarnLevel:
		return "[WARN]"
	case logrus.ErrorLevel:
		return "[ERRO]"
	case logrus.FatalLevel:
		return "[FATL]"
	case logrus.PanicLevel:
		return "[PANC]"
	}

	return ""
}

func formatTime(timestamp time.Time) string {
	return timestamp.Format("[2006-01-02 15:04:05]")
}

func initSender() {
	for _, sndr := range senders {
		sndr.Init()
	}
}

func Init() {
	initSender()

	logrus.SetFormatter(&formatter{})
	logrus.AddHook(&logHook{})
	logrus.SetOutput(os.Stderr)
	logrus.SetLevel(logrus.InfoLevel)
}

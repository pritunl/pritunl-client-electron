// Logger system outputs to log file.
package logger

import (
	"github.com/Sirupsen/logrus"
	"os"
)

var (
	buffer  = make(chan *logrus.Entry, 32)
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

func initSender() {
	for _, sndr := range senders {
		sndr.Init()
	}

	go func() {
		for {
			entry := <-buffer

			if len(entry.Message) > 7 && entry.Message[:7] == "logger:" {
				continue
			}

			for _, sndr := range senders {
				sndr.Parse(entry)
			}
		}
	}()
}

func Init() {
	initSender()

	logrus.SetFormatter(&formatter{})
	logrus.AddHook(&logHook{})
	logrus.SetOutput(os.Stderr)
	logrus.SetLevel(logrus.InfoLevel)
}

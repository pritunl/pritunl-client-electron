// Logger system outputs to log file.
package logger

import (
	"strings"

	"github.com/sirupsen/logrus"
)

var (
	senders = []sender{}
	buffer  = make(chan *logrus.Entry, 256)
)

func initSender() {
	for _, sndr := range senders {
		sndr.Init()
	}

	go func() {
		for {
			entry := <-buffer

			if strings.HasPrefix(entry.Message, "logger:") {
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
	logrus.SetOutput(&Writer{})
	logrus.SetLevel(logrus.InfoLevel)
}

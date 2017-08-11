// Logger system outputs to log file.
package logger

import (
	"github.com/Sirupsen/logrus"
	"os"
)

var (
	senders = []sender{}
)

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

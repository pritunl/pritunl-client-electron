package connection

import (
	"regexp"
	"runtime/debug"

	"github.com/sirupsen/logrus"
)

var (
	ipReg      = regexp.MustCompile(`(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}`)
	profileReg = regexp.MustCompile(`[^a-z0-9_\- ]+`)
)

func ThreadWatch(msg string) {
	panc := recover()
	if panc != nil {
		logrus.WithFields(logrus.Fields{
			"stack": string(debug.Stack()),
			"panic": panc,
		}).Error(msg)
		panic(panc)
	}
}

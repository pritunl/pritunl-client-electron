package connection

import (
	"time"

	"github.com/pritunl/pritunl-client-electron/service/utils"
	"github.com/sirupsen/logrus"
)

const (
	Deadline = 60 * time.Second
	OvpnMode = "ovpn"
	WgMode   = "wg"
)

var (
	Shutdown = false
)

func SetShutdown() {
	logrus.WithFields(logrus.Fields{
		"trace": utils.GetStackTrace(),
	}).Info("connection: Set shutdown")
	Shutdown = true
}

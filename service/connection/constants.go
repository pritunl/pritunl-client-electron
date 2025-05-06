package connection

import (
	"time"

	"github.com/pritunl/pritunl-client-electron/service/sprofile"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"github.com/sirupsen/logrus"
)

const (
	LogClose            = false
	Deadline            = 60 * time.Second
	SingleSignOnTimeout = 90 * time.Second
	OvpnMode            = "ovpn"
	WgMode              = "wg"
	NmOvpnUser          = "nm-openvpn"
)

var (
	Shutdown  = false
	DnsForced = false
	Ping      = time.Now()
)

func SetShutdown() {
	logrus.WithFields(logrus.Fields{
		"trace": utils.GetStackTrace(),
	}).Info("connection: Set shutdown")
	Shutdown = true
	sprofile.Shutdown()
}

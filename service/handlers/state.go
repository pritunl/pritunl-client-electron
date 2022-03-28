package handlers

import (
	"runtime"

	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-client-electron/service/constants"
	"github.com/pritunl/pritunl-client-electron/service/profile"
	"github.com/pritunl/pritunl-client-electron/service/update"
)

type stateData struct {
	Wg      bool   `json:"wg"`
	Version string `json:"version"`
	Upgrade bool   `json:"upgrade"`
}

func stateGet(c *gin.Context) {
	data := &stateData{
		Wg:      false,
		Version: constants.Version,
		Upgrade: update.Upgrade,
	}

	switch runtime.GOOS {
	case "linux", "darwin":
		if profile.GetWgPath() != "" && profile.GetWgQuickPath() != "" {
			data.Wg = true
		}

		break
	case "windows":
		if profile.GetWgPath() != "" {
			data.Wg = true
		}

		break
	default:
		panic("handlers: Not implemented")
	}

	c.JSON(200, data)
}

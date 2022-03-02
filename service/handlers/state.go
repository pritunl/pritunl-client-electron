package handlers

import (
	"runtime"

	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-client-electron/service/profile"
)

type stateData struct {
	Wg bool `json:"wg"`
}

func stateGet(c *gin.Context) {
	data := &stateData{
		Wg: false,
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

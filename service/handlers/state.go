package handlers

import (
	"runtime"

	"github.com/dhurley94/pritunl-client-electron/service/profile"
	"github.com/gin-gonic/gin"
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

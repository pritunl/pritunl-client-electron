package handlers

import (
	"os/exec"
	"runtime"

	"github.com/gin-gonic/gin"
)

type stateData struct {
	Wg bool `json:"wg"`
}

func stateGet(c *gin.Context) {
	data := &stateData{
		Wg: false,
	}

	if runtime.GOOS == "windows" {
		path, err := exec.LookPath("wg.exe")
		if path != "" && err == nil {
			data.Wg = true
		}
	} else {
		path, err := exec.LookPath("wg")
		if path != "" && err == nil {
			data.Wg = true
		}
	}

	c.JSON(200, data)
}

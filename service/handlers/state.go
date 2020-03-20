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

	switch runtime.GOOS {
	case "windows":
		path, err := exec.LookPath("wg.exe")
		if path != "" && err == nil {
			data.Wg = true
		}

		break
	case "darwin":
		path, err := exec.LookPath("wg")
		path2, err2 := exec.LookPath("wireguard-go")
		path3, err3 := exec.LookPath("wireguard-go")
		if path != "" && path2 != "" && path3 != "" &&
			err == nil && err2 == nil && err3 == nil {

			data.Wg = true
		}

		break
	case "linux":
		path, err := exec.LookPath("wg")
		if path != "" && err == nil {
			data.Wg = true
		}

		break
	default:
		panic("handlers: Not implemented")
	}

	c.JSON(200, data)
}

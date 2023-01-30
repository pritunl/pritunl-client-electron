package config

import (
	"path/filepath"
	"runtime"

	"github.com/pritunl/pritunl-client-electron/service/utils"
)

func GetPath() string {
	switch runtime.GOOS {
	case "windows":
		return filepath.Join(utils.GetWinDrive(), "ProgramData",
			"Pritunl", "pritunl-client.json")
	case "darwin":
		return filepath.Join("/", "var",
			"lib", "pritunl-client", "pritunl-client.json")
	case "linux":
		return filepath.Join("/", "var",
			"lib", "pritunl-client", "pritunl-client.json")
	default:
		panic("profile: Not implemented")
	}
}

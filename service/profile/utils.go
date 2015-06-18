package profile

import (
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"os"
	"path/filepath"
	"runtime"
)

func getOpenvpnPath() (pth string) {
	switch runtime.GOOS {
	case "windows":
		pth = filepath.Join(utils.GetRootDir(), "openvpn", "openvpn.exe")
		if _, err := os.Stat(pth); os.IsNotExist(err) {
			pth = filepath.Join(utils.GetRootDir(), "..",
				"openvpn_win32", "openvpn.exe")
		}
	case "darwin":
		pth = filepath.Join("/", "usr", "local", "sbin", "pritunl-openvpn")
		if _, err := os.Stat(pth); os.IsNotExist(err) {
			pth = filepath.Join(utils.GetRootDir(), "..",
				"openvpn_osx", "openvpn")
		}
	case "linux":
		pth = "openvpn"
	default:
		panic("profile: Not implemented")
	}

	return
}

func GetStatus() (status bool) {
	for _, prfl := range Profiles {
		if prfl.Status == "connected" {
			status = true
		}
	}

	return
}

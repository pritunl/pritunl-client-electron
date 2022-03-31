package tuntap

import (
	"path/filepath"

	"github.com/pritunl/pritunl-client-electron/service/constants"
	"github.com/pritunl/pritunl-client-electron/service/utils"
)

var (
	curSize = 0
)

func getInstallPath() (pth string) {
	if constants.Development {
		return filepath.Join(utils.GetRootDir(), "..",
			"tuntap_win", "tapinstall.exe")
	}

	return filepath.Join(utils.GetRootDir(), "tuntap", "tapinstall.exe")
}

func getDriverPath() (pth string) {
	if constants.Development {
		return filepath.Join(utils.GetRootDir(), "..",
			"tuntap_win", "OemVista.inf")
	}

	return filepath.Join(utils.GetRootDir(), "tuntap", "OemVista.inf")
}

func Clean() (err error) {
	installPath := getInstallPath()

	_, _ = utils.ExecCombinedOutputLogged(
		[]string{
			"No devices",
		},
		installPath,
		"remove", "tap0901",
	)

	return
}

func Resize(size int) (err error) {
	installPath := getInstallPath()
	driverPath := getDriverPath()

	if size <= 3 {
		size = 3
	} else if size < 6 {
		size = 6
	} else {
		size = 9
	}

	add := size - curSize

	for i := 0; i < add; i++ {
		_, err = utils.ExecCombinedOutputLogged(
			nil,
			installPath,
			"install", driverPath, "tap0901",
		)
		if err != nil {
			return
		}

		curSize += 1
	}

	return
}

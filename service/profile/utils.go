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
		pth = filepath.Join(utils.GetRootDir(), "openvpn",
			utils.GetWinArch(), "openvpn.exe")
		if _, err := os.Stat(pth); os.IsNotExist(err) {
			pth = filepath.Join(utils.GetRootDir(), "..",
				"openvpn_win", utils.GetWinArch(), "openvpn.exe")
		}
	case "darwin":
		pth = filepath.Join(string(os.PathSeparator), "usr", "local",
			"bin", "pritunl-openvpn")
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
	for _, prfl := range GetProfiles() {
		if prfl.Status == "connected" {
			status = true
		}
	}

	return
}

func GetProfile(id string) (prfl *Profile) {
	Profiles.RLock()
	prfl = Profiles.m[id]
	Profiles.RUnlock()
	return
}

func GetProfiles() (prfls map[string]*Profile) {
	prfls = map[string]*Profile{}

	Profiles.RLock()
	for _, prfl := range Profiles.m {
		prfls[prfl.Id] = prfl
	}
	Profiles.RUnlock()

	return
}

func RestartProfiles() (err error) {
	for _, prfl := range GetProfiles() {
		prfl2 := prfl.Copy()

		err = prfl.Stop()
		if err != nil {
			return
		}

		prfl.Wait()

		err = prfl2.Start(false)
		if err != nil {
			return
		}
	}

	return
}

func ResetProfiles() {
	for _, prfl := range GetProfiles() {
		prfl.Reset()
	}
}

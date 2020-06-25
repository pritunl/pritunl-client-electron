package profile

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"sync"
	"time"

	"github.com/pritunl/pritunl-client-electron/service/constants"
	"github.com/pritunl/pritunl-client-electron/service/utils"
)

var (
	restartLock sync.Mutex
)

func GetWgPath() string {
	switch runtime.GOOS {
	case "windows":
		path, _ := exec.LookPath("wg.exe")
		if path != "" {
			return path
		}

		break
	case "darwin":
		path, _ := exec.LookPath("/usr/bin/wg")
		if path != "" {
			return path
		}

		path, _ = exec.LookPath("/usr/local/bin/wg")
		if path != "" {
			return path
		}

		break
	case "linux":
		path, _ := exec.LookPath("wg")
		if path != "" {
			return path
		}

		break
	default:
		panic("handlers: Not implemented")
	}

	return ""
}

func GetWgQuickPath() string {
	switch runtime.GOOS {
	case "windows":
		path, _ := exec.LookPath("wg-quick.exe")
		if path != "" {
			return path
		}

		break
	case "darwin":
		path, _ := exec.LookPath("/usr/bin/wg-quick")
		if path != "" {
			return path
		}

		path, _ = exec.LookPath("/usr/local/bin/wg-quick")
		if path != "" {
			return path
		}

		break
	case "linux":
		path, _ := exec.LookPath("wg-quick")
		if path != "" {
			return path
		}

		break
	default:
		panic("handlers: Not implemented")
	}

	return ""
}

func getOpenvpnPath() (pth string) {
	if constants.Development {
		switch runtime.GOOS {
		case "windows":
			pth = filepath.Join(utils.GetRootDir(), "..",
				"openvpn_win", "openvpn.exe")
		case "darwin":
			pth = filepath.Join(utils.GetRootDir(), "..",
				"openvpn_osx", "openvpn")
		case "linux":
			pth = "openvpn"
		default:
			panic("profile: Not implemented")
		}

		return
	}

	switch runtime.GOOS {
	case "windows":
		pth = filepath.Join(utils.GetRootDir(), "openvpn", "openvpn.exe")
		break
	case "darwin":
		pth = filepath.Join(string(os.PathSeparator), "Applications",
			"Pritunl.app", "Contents", "Resources", "pritunl-openvpn")
		break
	case "linux":
		pth = "openvpn"
		break
	default:
		panic("profile: Not implemented")
	}

	return
}

func getOpenvpnDir() (pth string) {
	if constants.Development {
		switch runtime.GOOS {
		case "windows":
			pth = filepath.Join(utils.GetRootDir(), "..", "openvpn_win")
		case "darwin":
			pth = ""
		case "linux":
			pth = ""
		default:
			panic("profile: Not implemented")
		}

		return
	}

	switch runtime.GOOS {
	case "windows":
		pth = filepath.Join(utils.GetRootDir(), "openvpn")
	case "darwin":
		pth = ""
	case "linux":
		pth = ""
	default:
		panic("profile: Not implemented")
	}

	return
}

func Clean() (err error) {
	if runtime.GOOS != "windows" {
		return
	}

	for i := 0; i < 10; i++ {
		_, _ = utils.ExecOutput(
			"sc.exe", "stop", fmt.Sprintf("WireGuardTunnel$pritunl%d", i),
		)
		time.Sleep(100 * time.Millisecond)
		_, _ = utils.ExecOutput(
			"sc.exe", "delete", fmt.Sprintf("WireGuardTunnel$pritunl%d", i),
		)
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

func RestartProfiles(resetNet bool) (err error) {
	restartLock.Lock()
	defer restartLock.Unlock()

	prfls := GetProfiles()
	prfls2 := map[string]*Profile{}

	for _, prfl := range prfls {
		if prfl.stop {
			continue
		}

		prfl2 := prfl.Copy()
		prfls2[prfl2.Id] = prfl2

		err = prfl.Stop()
		if err != nil {
			return
		}
	}

	for _, prfl := range prfls {
		prfl.Wait()
	}

	time.Sleep(resetWait)

	if resetNet {
		utils.ResetNetworking()
		time.Sleep(netResetWait)
	}

	for _, prfl := range prfls2 {
		if prfl.Reconnect {
			err = prfl.Start(false)
			if err != nil {
				return
			}
		}
	}

	return
}

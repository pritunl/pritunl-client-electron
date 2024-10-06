package connection

import (
	"os"
	"os/exec"
	"path/filepath"
	"runtime"

	"github.com/pritunl/pritunl-client-electron/service/constants"
	"github.com/pritunl/pritunl-client-electron/service/utils"
)

func GetBashPath() string {
	switch runtime.GOOS {
	case "darwin":
		path, _ := exec.LookPath("/usr/local/bin/bash")
		if path != "" {
			return path
		}

		path, _ = exec.LookPath("/opt/homebrew/bin/bash")
		if path != "" {
			return path
		}

		path, _ = exec.LookPath("/bin/bash")
		if path != "" {
			return path
		}

		break
	case "linux":
		break
	case "windows":
		break
	default:
		panic("paths: Bash path not implemented")
	}

	return ""
}

func GetWgPath() string {
	switch runtime.GOOS {
	case "windows":
		path, _ := exec.LookPath(filepath.Join(utils.GetWinDrive(),
			"Program Files", "WireGuard", "wg.exe"))
		exists, _ := utils.Exists(path)
		if exists {
			return path
		}

		path, _ = exec.LookPath("wg.exe")
		if path != "" {
			return path
		}

		break
	case "darwin":
		exists, _ := utils.Exists("/usr/bin/wg")
		if exists {
			return "/usr/bin/wg"
		}

		exists, _ = utils.Exists("/usr/local/bin/wg")
		if exists {
			return "/usr/local/bin/wg"
		}

		exists, _ = utils.Exists("/opt/homebrew/bin/wg")
		if exists {
			return "/opt/homebrew/bin/wg"
		}

		path, _ := exec.LookPath("wg")
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
		panic("paths: WG path not implemented")
	}

	return ""
}

func GetWgQuickPath() string {
	switch runtime.GOOS {
	case "windows":
		path, _ := exec.LookPath(filepath.Join(utils.GetWinDrive(),
			"Program Files", "WireGuard", "wg-quick.exe"))
		exists, _ := utils.Exists(path)
		if exists {
			return path
		}

		path, _ = exec.LookPath("wg-quick.exe")
		if path != "" {
			return path
		}

		break
	case "darwin":
		exists, _ := utils.Exists("/usr/bin/wg-quick")
		if exists {
			return "/usr/bin/wg-quick"
		}

		exists, _ = utils.Exists("/usr/local/bin/wg-quick")
		if exists {
			return "/usr/local/bin/wg-quick"
		}

		exists, _ = utils.Exists("/opt/homebrew/bin/wg-quick")
		if exists {
			return "/opt/homebrew/bin/wg-quick"
		}

		path, _ := exec.LookPath("wg-quick")
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
		panic("paths: WG quick path not implemented")
	}

	return ""
}

func GetWgUtilPath() string {
	switch runtime.GOOS {
	case "windows":
		path, _ := exec.LookPath(filepath.Join(utils.GetWinDrive(),
			"Program Files", "WireGuard", "wireguard.exe"))
		exists, _ := utils.Exists(path)
		if exists {
			return path
		}

		path, _ = exec.LookPath("wireguard.exe")
		if path != "" {
			return path
		}

		break
	case "darwin":
		break
	case "linux":
		break
	default:
		panic("paths: WG util path not implemented")
	}

	return ""
}

func GetWgConfDir() (dir1 string, dir2 string, err error) {
	switch runtime.GOOS {
	case "windows":
		dir1, err = utils.GetTempDir()
		if err != nil {
			return
		}

		return
	case "darwin":
		dir1 = "/usr/local/etc/wireguard"

		exists, e := utils.ExistsDir("/opt/homebrew/etc")
		if e != nil {
			err = e
			return
		}
		if exists {
			dir2 = "/opt/homebrew/etc/wireguard"
		}

		return
	case "linux":
		dir1 = "/etc/wireguard"
		return
	default:
		panic("paths: WG util path not implemented")
	}
}

func GetOvpnDir() (pth string) {
	if constants.Development {
		switch runtime.GOOS {
		case "windows":
			if runtime.GOARCH == "arm" || runtime.GOARCH == "arm64" {
				pth = filepath.Join(utils.GetRootDir(),
					"..", "openvpn_win", "openvpn_arm64")
			} else {
				pth = filepath.Join(utils.GetRootDir(),
					"..", "openvpn_win", "openvpn_amd64")
			}
		case "darwin":
			pth = ""
		case "linux":
			pth = ""
		default:
			panic("paths: Ovpn dev dir not implemented")
		}

		return
	}

	switch runtime.GOOS {
	case "windows":
		if runtime.GOARCH == "arm" || runtime.GOARCH == "arm64" {
			pth = filepath.Join(utils.GetRootDir(), "openvpn_arm64")
		} else {
			pth = filepath.Join(utils.GetRootDir(), "openvpn_amd64")
		}
	case "darwin":
		pth = ""
	case "linux":
		pth = ""
	default:
		panic("paths: Ovpn dir not implemented")
	}

	return
}

func GetOvpnPath() (pth string) {
	if constants.Development {
		switch runtime.GOOS {
		case "windows":
			if runtime.GOARCH == "arm" || runtime.GOARCH == "arm64" {
				pth = filepath.Join(utils.GetRootDir(), "..",
					"openvpn_win", "openvpn_arm64", "openvpn.exe")
			} else {
				pth = filepath.Join(utils.GetRootDir(), "..",
					"openvpn_win", "openvpn_amd64", "openvpn.exe")
			}
			break
		case "darwin":
			if constants.Macos10 {
				pth = filepath.Join(utils.GetRootDir(), "..",
					"openvpn_macos", "openvpn10")
			} else {
				pth = filepath.Join(utils.GetRootDir(), "..",
					"openvpn_macos", "openvpn_arm64")
			}
			break
		case "linux":
			pth = "openvpn"
			break
		default:
			panic("paths: Ovpn dev path not implemented")
		}

		return
	}

	switch runtime.GOOS {
	case "windows":
		if runtime.GOARCH == "arm" || runtime.GOARCH == "arm64" {
			pth = filepath.Join(utils.GetRootDir(),
				"openvpn_arm64", "openvpn.exe")
		} else {
			pth = filepath.Join(utils.GetRootDir(),
				"openvpn_amd64", "openvpn.exe")
		}
		break
	case "darwin":
		if constants.Macos10 {
			pth = filepath.Join(string(os.PathSeparator), "Applications",
				"Pritunl.app", "Contents", "Resources", "pritunl-openvpn10")
		} else {
			pth = filepath.Join(string(os.PathSeparator), "Applications",
				"Pritunl.app", "Contents", "Resources", "pritunl-openvpn")
		}
		break
	case "linux":
		pth = "openvpn"
		break
	default:
		panic("paths: Ovpn path not implemented")
	}

	return
}

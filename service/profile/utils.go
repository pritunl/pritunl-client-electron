package profile

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"

	"github.com/dropbox/godropbox/container/set"
	"github.com/pritunl/pritunl-client-electron/service/constants"
	"github.com/pritunl/pritunl-client-electron/service/event"
	"github.com/pritunl/pritunl-client-electron/service/sprofile"
	"github.com/pritunl/pritunl-client-electron/service/update"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"github.com/sirupsen/logrus"
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

		path, _ = exec.LookPath("/opt/homebrew/bin/wg")
		if path != "" {
			return path
		}

		path, _ = exec.LookPath("wg")
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

func GetWgUtilPath() string {
	return filepath.Join(utils.GetWinDrive(),
		"Program Files", "WireGuard", "wireguard.exe")
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

		path, _ = exec.LookPath("/opt/homebrew/bin/wg-quick")
		if path != "" {
			return path
		}

		path, _ = exec.LookPath("wg-quick")
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
			break
		case "darwin":
			if constants.Macos10 {
				pth = filepath.Join(utils.GetRootDir(), "..",
					"openvpn_macos", "openvpn10")
			} else {
				pth = filepath.Join(utils.GetRootDir(), "..",
					"openvpn_macos", "openvpn")
			}
			break
		case "linux":
			pth = "openvpn"
			break
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

		break
	case "linux":
		break
	case "windows":
		break
	default:
		panic("handlers: Not implemented")
	}
	return ""
}

func Clean() (err error) {
	if runtime.GOOS != "windows" {
		return
	}

	for i := 0; i < 10; i++ {
		_, _ = utils.ExecCombinedOutput(
			"sc.exe", "stop", fmt.Sprintf("WireGuardTunnel$pritunl%d", i),
		)
		time.Sleep(100 * time.Millisecond)
		_, _ = utils.ExecCombinedOutput(
			"sc.exe", "delete", fmt.Sprintf("WireGuardTunnel$pritunl%d", i),
		)
	}

	return
}

func UpdateSystemProfile(prfl *Profile, sPrfl *sprofile.Sprofile) {
	serverPublicKey := ""
	if sPrfl.ServerPublicKey != nil && len(sPrfl.ServerPublicKey) > 0 {
		serverPublicKey = strings.Join(sPrfl.ServerPublicKey, "\n")
	}

	lastMode := sPrfl.LastMode
	if lastMode == "" {
		lastMode = "ovpn"
	}

	prfl.Id = sPrfl.Id
	prfl.Mode = lastMode
	prfl.OrgId = sPrfl.OrganizationId
	prfl.UserId = sPrfl.UserId
	prfl.ServerId = sPrfl.ServerId
	prfl.SyncHosts = sPrfl.SyncHosts
	prfl.SyncToken = sPrfl.SyncToken
	prfl.SyncSecret = sPrfl.SyncSecret
	prfl.Data = sPrfl.OvpnData
	prfl.Username = "pritunl"
	prfl.Password = sPrfl.Password
	prfl.DynamicFirewall = sPrfl.DynamicFirewall
	prfl.DisableGateway = sPrfl.DisableGateway
	prfl.ForceDns = sPrfl.ForceDns
	prfl.SsoAuth = sPrfl.SsoAuth
	prfl.ServerPublicKey = serverPublicKey
	prfl.ServerBoxPublicKey = sPrfl.ServerBoxPublicKey
	prfl.TokenTtl = sPrfl.TokenTtl
	prfl.Reconnect = true
	prfl.SystemProfile = sPrfl
}

func ImportSystemProfile(sPrfl *sprofile.Sprofile) (prfl *Profile) {
	prfl = &Profile{
		Id: sPrfl.Id,
	}

	UpdateSystemProfile(prfl, sPrfl)

	prfl.Init()

	return
}

func GetStatus() (status bool) {
	for _, prfl := range GetProfiles() {
		if prfl.Status == "connected" {
			status = true
			return
		}
	}

	return
}

func GetActive() (active bool) {
	Profiles.RLock()
	active = len(Profiles.m) > 0
	Profiles.RUnlock()
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

func GetProfilesId() (prflsId set.Set) {
	prflsId = set.NewSet()

	Profiles.RLock()
	for _, prfl := range Profiles.m {
		prflsId.Add(prfl.Id)
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

		prfl.StopBackground()
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
			err = prfl.Start(false, true, true)
			if err != nil {
				return
			}
		}
	}

	return
}

func SyncSystemProfiles() (err error) {
	sprfls, err := sprofile.GetAll()
	if err != nil {
		return
	}

	prfls := GetProfiles()

	update := false
	waiter := sync.WaitGroup{}

	for _, sPrfl := range sprfls {
		curPrfl := prfls[sPrfl.Id]

		if sPrfl.State {
			if curPrfl == nil {
				prfl := ImportSystemProfile(sPrfl)

				update = true
				waiter.Add(1)

				go func() {
					err = prfl.Start(false, false, false)
					if err != nil {
						logrus.WithFields(logrus.Fields{
							"profile_id": prfl.Id,
							"error":      err,
						}).Error("profile: Failed to start system profile")
						err = nil
					}

					waiter.Done()
				}()
			} else if curPrfl.Mode != sPrfl.LastMode &&
				!(curPrfl.Mode == "ovpn" && sPrfl.LastMode == "") {

				update = true
				waiter.Add(1)

				go func() {
					curPrfl.Stop()

					prfl := ImportSystemProfile(sPrfl)
					err = prfl.Start(false, false, false)
					if err != nil {
						logrus.WithFields(logrus.Fields{
							"profile_id": curPrfl.Id,
							"error":      err,
						}).Error("profile: Failed to start system profile")
						err = nil
					}

					waiter.Done()
				}()
			}
		} else if curPrfl != nil {
			update = true
			waiter.Add(1)

			go func() {
				curPrfl.Stop()
				waiter.Done()
			}()
		}
	}

	waiter.Wait()

	if update {
		evt := event.Event{
			Type: "update",
			Data: &Profile{
				Id: "",
			},
		}
		evt.Init()

		status := GetStatus()

		if status {
			evt := event.Event{
				Type: "connected",
			}
			evt.Init()
		} else {
			evt := event.Event{
				Type: "disconnected",
			}
			evt.Init()
		}
	}

	return
}

func Shutdown() {
	shutdown = true
	sprofile.Shutdown()
}

func watchSystemProfiles() {
	time.Sleep(1 * time.Second)
	sprofile.Reload(true)

	for {
		time.Sleep(2 * time.Second)

		if shutdown {
			return
		}

		Profiles.RLock()
		n := len(Profiles.m)
		Profiles.RUnlock()
		if n == 0 {
			_ = update.Check()
		}

		err := SyncSystemProfiles()
		if err != nil {
			logrus.WithFields(logrus.Fields{
				"error": err,
			}).Error("profile: Failed to sync system profiles")
		}
	}
}

func WatchSystemProfiles() {
	go watchSystemProfiles()
}

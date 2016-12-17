// Miscellaneous utils.
package utils

import (
	"bufio"
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"github.com/Sirupsen/logrus"
	"github.com/dropbox/godropbox/container/set"
	"github.com/dropbox/godropbox/errors"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"sync"
)

var (
	lockedInterfaces set.Set
	networkResetLock sync.Mutex
)

func init() {
	lockedInterfaces = set.NewSet()
}

type Interface struct {
	Id   string
	Name string
}

type Interfaces []*Interface

func (intfs Interfaces) Len() int {
	return len(intfs)
}

func (intfs Interfaces) Swap(i, j int) {
	intfs[i], intfs[j] = intfs[j], intfs[i]
}

func (intfs Interfaces) Less(i, j int) bool {
	return intfs[i].Name < intfs[j].Name
}

func GetTaps() (interfaces []*Interface, err error) {
	interfaces = []*Interface{}

	cmd := exec.Command("ipconfig", "/all")

	output, err := cmd.CombinedOutput()
	if err != nil {
		err = &CommandError{
			errors.Wrap(err, "utils: Failed to exec ipconfig"),
		}
		return
	}

	buf := bytes.NewBuffer(output)
	scan := bufio.NewReader(buf)

	intName := ""
	intTap := false
	intAddr := ""

	for {
		lineByte, _, e := scan.ReadLine()
		if e != nil {
			if e == io.EOF {
				break
			}
			err = e
			panic(err)
			return
		}
		line := string(lineByte)

		if line == "" {
			continue
		}

		if strings.HasPrefix(line, "Ethernet adapter ") {
			intName = strings.Split(line, "Ethernet adapter ")[1]
			intName = intName[:len(intName)-1]
			intTap = false
			intAddr = ""
		} else if intName != "" {
			if strings.Contains(line, "TAP-Windows Adapter") {
				intTap = true
			} else if strings.Contains(line, "Physical Address") {
				intAddr = strings.Split(line, ":")[1]
				intAddr = strings.TrimSpace(intAddr)
			} else if intTap && intAddr != "" {
				intf := &Interface{
					Id:   intAddr,
					Name: intName,
				}
				interfaces = append(interfaces, intf)
				intName = ""
			}
		}
	}

	sort.Sort(Interfaces(interfaces))

	return
}

func AcquireTap() (intf *Interface, err error) {
	interfaces, err := GetTaps()
	if err != nil {
		return
	}

	for _, intrf := range interfaces {
		if !lockedInterfaces.Contains(intrf.Id) {
			lockedInterfaces.Add(intrf.Id)
			intf = intrf
			return
		}
	}

	return
}

func ReleaseTap(intf *Interface) {
	lockedInterfaces.Remove(intf.Id)
}

func GetScutilKey(key string) (val string, err error) {
	cmd := exec.Command("/usr/sbin/scutil")
	cmd.Stdin = strings.NewReader(
		fmt.Sprintf("open\nshow State:%s\nquit\n", key))

	output, err := cmd.CombinedOutput()
	if err != nil {
		err = &CommandError{
			errors.Wrap(err, "utils: Failed to exec scutil"),
		}
		return
	}

	val = strings.TrimSpace(string(output))

	return
}

func RemoveScutilKey(key string) (err error) {
	cmd := exec.Command("/usr/sbin/scutil")
	cmd.Stdin = strings.NewReader(
		fmt.Sprintf("open\nremove State:%s\nquit\n", key))

	err = cmd.Run()
	if err != nil {
		err = &CommandError{
			errors.Wrap(err, "utils: Failed to exec scutil"),
		}
		return
	}

	return
}

func ResetNetworking() {
	networkResetLock.Lock()
	defer networkResetLock.Unlock()

	if runtime.GOOS == "windows" {
		exec.Command("netsh", "interface", "ip", "delete",
			"destinationcache").Run()
		exec.Command("ipconfig", "/release").Run()
		exec.Command("ipconfig", "/renew").Run()
		exec.Command("arp", "-d", "*").Run()
		exec.Command("nbtstat", "-R").Run()
		exec.Command("nbtstat", "-RR").Run()
		exec.Command("ipconfig", "/flushdns").Run()
		exec.Command("nbtstat", "/registerdns").Run()
	} else if runtime.GOOS == "darwin" {
		cmd := exec.Command("/usr/sbin/networksetup", "-getcurrentlocation")

		output, err := cmd.CombinedOutput()
		if err != nil {
			err = &CommandError{
				errors.Wrap(err, "utils: Failed to get network location"),
			}
			logrus.WithFields(logrus.Fields{
				"error": err,
			}).Error("utils: Reset networking error")
			return
		}

		location := strings.TrimSpace(string(output))

		if location == "pritunl-reset" {
			return
		}

		err = exec.Command(
			"/usr/sbin/networksetup",
			"-createlocation",
			"pritunl-reset",
		).Run()
		if err != nil {
			err = &CommandError{
				errors.Wrap(err, "utils: Failed to create network location"),
			}
			logrus.WithFields(logrus.Fields{
				"error": err,
			}).Error("utils: Reset networking error")
		}

		err = exec.Command(
			"/usr/sbin/networksetup",
			"-switchtolocation",
			"pritunl-reset",
		).Run()
		if err != nil {
			err = &CommandError{
				errors.Wrap(err, "utils: Failed to set network location"),
			}
			logrus.WithFields(logrus.Fields{
				"error": err,
			}).Error("utils: Reset networking error")
		}

		err = exec.Command(
			"/usr/sbin/networksetup",
			"-switchtolocation",
			location,
		).Run()
		if err != nil {
			err = &CommandError{
				errors.Wrap(err, "utils: Failed to set network location"),
			}
			logrus.WithFields(logrus.Fields{
				"error": err,
			}).Error("utils: Reset networking error")
		}

		err = exec.Command(
			"/usr/sbin/networksetup",
			"-deletelocation",
			"pritunl-reset",
		).Run()
		if err != nil {
			err = &CommandError{
				errors.Wrap(err, "utils: Failed to delete network location"),
			}
			logrus.WithFields(logrus.Fields{
				"error": err,
			}).Error("utils: Reset networking error")
		}

		RemoveScutilKey("/Network/Pritunl/DNS")
	}
}

func ClearDNSCache() {
	if runtime.GOOS == "windows" {
		exec.Command("ipconfig", "/flushdns").Run()
	} else if runtime.GOOS == "darwin" {
		exec.Command("killall", "-HUP", "mDNSResponder").Run()
	}
}

func Uuid() (id string) {
	idByte := make([]byte, 16)

	_, err := rand.Read(idByte)
	if err != nil {
		err = &IoError{
			errors.Wrap(err, "utils: Failed to get random data"),
		}
		panic(err)
	}

	id = hex.EncodeToString(idByte[:])

	return
}

func GetRootDir() (pth string) {
	pth, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		panic(err)
	}

	return
}

func GetAuthPath() (pth string) {
	if runtime.GOOS == "windows" {
		pth = filepath.Join("C:\\", "ProgramData", "Pritunl")

		err := os.MkdirAll(pth, 0755)
		if err != nil {
			err = &IoError{
				errors.Wrap(err, "utils: Failed to create data directory"),
			}
			panic(err)
		}

		pth = filepath.Join(pth, "auth")
	} else {
		pth = filepath.Join(string(filepath.Separator), "tmp", "pritunl_auth")
	}

	return
}

func GetLogPath() (pth string) {
	if runtime.GOOS == "windows" {
		pth = filepath.Join("C:\\", "ProgramData", "Pritunl")

		err := os.MkdirAll(pth, 0755)
		if err != nil {
			err = &IoError{
				errors.Wrap(err, "utils: Failed to create data directory"),
			}
			panic(err)
		}

		pth = filepath.Join(pth, "pritunl.log")
	} else {
		pth = filepath.Join(string(filepath.Separator),
			"var", "log", "pritunl.log")
	}

	return
}

func GetTempDir() (pth string, err error) {
	if runtime.GOOS == "windows" {
		pth = filepath.Join("C:\\", "ProgramData", "Pritunl")
		err = os.MkdirAll(pth, 0755)
	} else {
		pth = filepath.Join(string(filepath.Separator), "tmp", "pritunl")
		err = os.MkdirAll(pth, 0700)
	}

	if err != nil {
		err = &IoError{
			errors.Wrap(err, "utils: Failed to create temp directory"),
		}
		return
	}

	return
}

func GetWinArch() (arch string) {
	if os.Getenv("PROGRAMFILES(X86)") == "" {
		arch = "32"
	} else {
		arch = "64"
	}

	return
}

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
	"runtime/debug"
	"sort"
	"strings"
	"sync"
	"time"
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

func GetScutilKey(typ, key string) (val string, err error) {
	cmd := exec.Command("/usr/sbin/scutil")
	cmd.Stdin = strings.NewReader(
		fmt.Sprintf("open\nshow %s:%s\nquit\n", typ, key))

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

func RemoveScutilKey(typ, key string) (err error) {
	cmd := exec.Command("/usr/sbin/scutil")
	cmd.Stdin = strings.NewReader(
		fmt.Sprintf("open\nremove %s:%s\nquit\n", typ, key))

	err = cmd.Run()
	if err != nil {
		err = &CommandError{
			errors.Wrap(err, "utils: Failed to exec scutil"),
		}
		return
	}

	return
}

func CopyScutilKey(typ, src, dst string) (err error) {
	cmd := exec.Command("/usr/sbin/scutil")
	cmd.Stdin = strings.NewReader(
		fmt.Sprintf("open\n"+
			"get %s:%s\n"+
			"set %s:%s\n"+
			"quit\n", typ, src, typ, dst))

	err = cmd.Run()
	if err != nil {
		err = &CommandError{
			errors.Wrap(err, "utils: Failed to exec scutil"),
		}
		return
	}

	return
}

func GetScutilService() (serviceId string, err error) {
	for i := 0; i < 20; i++ {
		data, e := GetScutilKey("State", "/Network/Global/IPv4")
		if e != nil {
			err = e
			return
		}

		dataSpl := strings.Split(data, "PrimaryService :")
		if len(dataSpl) < 2 {
			if i < 19 {
				time.Sleep(250 * time.Millisecond)
				continue
			}

			err = &CommandError{
				errors.New(
					"utils: Failed to find primary service from scutil"),
			}
			return
		}

		serviceId = strings.Split(dataSpl[1], "\n")[0]
		serviceId = strings.TrimSpace(serviceId)

		break
	}

	return
}

func RestoreScutilDns() (err error) {
	serviceId, err := GetScutilService()
	if err != nil {
		return
	}

	restoreKey := fmt.Sprintf("/Network/Pritunl/Restore/%s", serviceId)
	serviceKey := fmt.Sprintf("/Network/Service/%s/DNS", serviceId)

	data, err := GetScutilKey("State", restoreKey)
	if err != nil {
		return
	}

	if strings.Contains(data, "No such key") {
		return
	}

	data, err = GetScutilKey("State", serviceKey)
	if err != nil {
		return
	}

	if strings.Contains(data, "Pritunl : true") {
		err = CopyScutilKey("State", restoreKey, serviceKey)
		if err != nil {
			return
		}
	}

	data, err = GetScutilKey("Setup", serviceKey)
	if err != nil {
		return
	}

	if strings.Contains(data, "Pritunl : true") {
		data, err = GetScutilKey("Setup", restoreKey)
		if err != nil {
			return
		}

		if strings.Contains(data, "No such key") {
			err = RemoveScutilKey("Setup", serviceKey)
			if err != nil {
				return
			}
		} else {
			err = CopyScutilKey("Setup", restoreKey, serviceKey)
			if err != nil {
				return
			}
		}
	}

	ClearDNSCache()

	return
}

func CopyScutilDns(src string) (err error) {
	serviceId, err := GetScutilService()
	if err != nil {
		return
	}

	cmd := exec.Command("/usr/sbin/scutil")
	cmd.Stdin = strings.NewReader(
		fmt.Sprintf("open\n"+
			"get State:%s\n"+
			"set State:/Network/Service/%s/DNS\n"+
			"set Setup:/Network/Service/%s/DNS\n"+
			"quit\n", src, serviceId, serviceId))

	err = cmd.Run()
	if err != nil {
		err = &CommandError{
			errors.Wrap(err, "utils: Failed to exec scutil"),
		}
		return
	}

	ClearDNSCache()

	return
}

func BackupScutilDns() (err error) {
	serviceId, err := GetScutilService()
	if err != nil {
		return
	}

	restoreKey := fmt.Sprintf("/Network/Pritunl/Restore/%s", serviceId)
	serviceKey := fmt.Sprintf("/Network/Service/%s/DNS", serviceId)

	data, err := GetScutilKey("State", serviceKey)
	if err != nil {
		return
	}

	if strings.Contains(data, "No such key") ||
		strings.Contains(data, "Pritunl : true") {

		return
	}

	err = CopyScutilKey("State", serviceKey, restoreKey)
	if err != nil {
		return
	}

	data, err = GetScutilKey("Setup", serviceKey)
	if err != nil {
		return
	}

	if strings.Contains(data, "No such key") {
		err = RemoveScutilKey("Setup", restoreKey)
		if err != nil {
			return
		}
	} else {
		err = CopyScutilKey("Setup", serviceKey, restoreKey)
		if err != nil {
			return
		}
	}

	return
}

func GetScutilConnIds() (ids []string, err error) {
	ids = []string{}

	cmd := exec.Command("/usr/sbin/scutil")
	cmd.Stdin = strings.NewReader("open\nlist\nquit\n")

	output, err := cmd.CombinedOutput()
	if err != nil {
		err = &CommandError{
			errors.Wrap(err, "utils: Failed to exec scutil"),
		}
		return
	}

	for _, line := range strings.Split(string(output), "\n") {
		if !strings.Contains(line, "State:/Network/Pritunl/Connection/") {
			continue
		}

		spl := strings.Split(line, "State:/Network/Pritunl/Connection/")
		if len(spl) == 2 {
			ids = append(ids, strings.TrimSpace(spl[1]))
		}
	}

	return
}

func ClearScutilKeys() (err error) {
	remove := ""

	cmd := exec.Command("/usr/sbin/scutil")
	cmd.Stdin = strings.NewReader("open\nlist\nquit\n")

	output, err := cmd.CombinedOutput()
	if err != nil {
		err = &CommandError{
			errors.Wrap(err, "utils: Failed to exec scutil"),
		}
		return
	}

	for _, line := range strings.Split(string(output), "\n") {
		if !strings.Contains(line, "State:/Network/Pritunl") {
			continue
		}

		if strings.Contains(line, "State:/Network/Pritunl/Restore") {
			continue
		}

		spl := strings.Split(line, "State:")
		if len(spl) != 2 {
			continue
		}

		key := strings.TrimSpace(spl[1])
		remove += fmt.Sprintf("remove State:%s\n", key)
	}

	if remove == "" {
		return
	}

	cmd = exec.Command("/usr/sbin/scutil")
	cmd.Stdin = strings.NewReader("open\n" + remove + "quit\n")

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
	}
}

func ClearDNSCache() {
	if runtime.GOOS == "windows" {
		exec.Command("ipconfig", "/flushdns").Run()
		go func() {
			defer func() {
				panc := recover()
				if panc != nil {
					logrus.WithFields(logrus.Fields{
						"stack": string(debug.Stack()),
						"panic": panc,
					}).Error("utils: Panic")
					panic(panc)
				}
			}()

			for i := 0; i < 3; i++ {
				time.Sleep(1 * time.Second)
				exec.Command("ipconfig", "/flushdns").Run()
			}
		}()
	} else if runtime.GOOS == "darwin" {
		exec.Command("killall", "-HUP", "mDNSResponder").Run()
		go func() {
			defer func() {
				panc := recover()
				if panc != nil {
					logrus.WithFields(logrus.Fields{
						"stack": string(debug.Stack()),
						"panic": panc,
					}).Error("utils: Panic")
					panic(panc)
				}
			}()

			for i := 0; i < 3; i++ {
				time.Sleep(1 * time.Second)
				exec.Command("killall", "-HUP", "mDNSResponder").Run()
			}
		}()
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
		pth = filepath.Join(string(filepath.Separator),
			"var", "lib", "pritunl")

		err := os.MkdirAll(pth, 0755)
		if err != nil {
			err = &IoError{
				errors.Wrap(err, "utils: Failed to create data directory"),
			}
			panic(err)
		}

		pth = filepath.Join(pth, "auth")
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

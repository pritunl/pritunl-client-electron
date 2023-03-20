// Miscellaneous utils.
package utils

import (
	"bufio"
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"runtime"
	"runtime/debug"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/dropbox/godropbox/container/set"
	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/command"
	"github.com/pritunl/pritunl-client-electron/service/constants"
	"github.com/pritunl/pritunl-client-electron/service/errortypes"
	"github.com/pritunl/pritunl-client-electron/service/platform"
	"github.com/sirupsen/logrus"
)

var (
	lockedInterfaces set.Set
	networkResetLock sync.Mutex
	macDnsLock       = sync.Mutex{}
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

	cmd := command.Command("ipconfig", "/all")

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
	macDnsLock.Lock()
	defer macDnsLock.Unlock()

	cmd := command.Command("/usr/sbin/scutil")
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
	macDnsLock.Lock()
	defer macDnsLock.Unlock()

	cmd := command.Command("/usr/sbin/scutil")
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
	macDnsLock.Lock()
	defer macDnsLock.Unlock()

	cmd := command.Command("/usr/sbin/scutil")
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

type ScutilKey struct {
	Type string
	Key  string
}

func CopyScutilMultiKey(typ, src string, dsts ...*ScutilKey) (err error) {
	macDnsLock.Lock()
	defer macDnsLock.Unlock()

	stdin := fmt.Sprintf("open\nget %s:%s\n", typ, src)
	for _, dst := range dsts {
		stdin += fmt.Sprintf("set %s:%s\n", dst.Type, dst.Key)
	}
	stdin += "quit\n"

	cmd := command.Command("/usr/sbin/scutil")
	cmd.Stdin = strings.NewReader(stdin)

	err = cmd.Run()
	if err != nil {
		err = &CommandError{
			errors.Wrap(err, "utils: Failed to exec scutil"),
		}
		return
	}

	return
}

func CopyClearScutilMultiKey(typ, src string, dsts ...*ScutilKey) (
	err error) {

	macDnsLock.Lock()
	defer macDnsLock.Unlock()

	stdin := fmt.Sprintf("open\nget %s:%s\n", typ, src)
	for _, dst := range dsts {
		if dst.Type == "State" {
			stdin += fmt.Sprintf("remove %s:%s\n", dst.Type, dst.Key)
		}
		stdin += fmt.Sprintf("set %s:%s\n", dst.Type, dst.Key)
	}
	stdin += "quit\n"

	cmd := command.Command("/usr/sbin/scutil")
	cmd.Stdin = strings.NewReader(stdin)

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
	for i := 0; i < 80; i++ {
		data, e := GetScutilKey("State", "/Network/Global/IPv4")
		if e != nil {
			err = e
			return
		}

		dataSpl := strings.Split(data, "PrimaryService :")
		if len(dataSpl) < 2 {
			if i < 79 {
				time.Sleep(250 * time.Millisecond)
				continue
			}

			logrus.WithFields(logrus.Fields{
				"output": data,
			}).Error("utils: Failed to find primary service from scutil")

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
	if runtime.GOOS != "darwin" {
		return
	}

	logrus.Info("utils: Restore DNS")

	connIds, err := GetScutilConnIds()
	if err != nil {
		return
	}
	connected := len(connIds) != 0

	serviceId, err := GetScutilService()
	if err != nil {
		return
	}

	restoreKey := ""
	if connected {
		restoreKey = fmt.Sprintf(
			"/Network/Pritunl/Connection/%s", connIds[0])
	} else {
		restoreKey = fmt.Sprintf(
			"/Network/Pritunl/Restore/%s", serviceId)
	}

	serviceKey := fmt.Sprintf("/Network/Service/%s/DNS", serviceId)

	if !connected {
		data, e := GetScutilKey("State", serviceKey)
		if e != nil {
			err = e
			return
		}

		data2, e := GetScutilKey("Setup", serviceKey)
		if e != nil {
			err = e
			return
		}

		if !strings.Contains(data, "Pritunl : true") &&
			!strings.Contains(data2, "Pritunl : true") {

			logrus.WithFields(logrus.Fields{
				"restore_key": restoreKey,
				"service_key": serviceKey,
			}).Info("utils: DNS not active")
			return
		}

		data, err = GetScutilKey("State", restoreKey)
		if err != nil {
			return
		}

		if strings.Contains(data, "No such key") {
			logrus.WithFields(logrus.Fields{
				"restore_key": restoreKey,
				"service_key": serviceKey,
			}).Error("utils: Failed to find restore key")

			err = &errortypes.NotFoundError{
				errors.New("utils: Restore key not found"),
			}
			return
		}
	}

	err = CopyClearScutilMultiKey(
		"State", restoreKey,
		&ScutilKey{
			Type: "Setup",
			Key:  serviceKey,
		},
		&ScutilKey{
			Type: "State",
			Key:  serviceKey,
		},
	)
	if err != nil {
		return
	}

	ClearDNSCache()

	return
}

func RefreshScutilDns() (err error) {
	if runtime.GOOS != "darwin" {
		return
	}

	serviceId, err := GetScutilService()
	if err != nil {
		return
	}

	serviceKey := fmt.Sprintf("/Network/Service/%s/DNS", serviceId)

	err = CopyClearScutilMultiKey(
		"State", serviceKey,
		&ScutilKey{
			Type: "State",
			Key:  serviceKey,
		},
		&ScutilKey{
			Type: "Setup",
			Key:  serviceKey,
		},
	)
	if err != nil {
		return
	}

	ClearDNSCacheFast()

	return
}

func BackupScutilDns() (err error) {
	if runtime.GOOS != "darwin" {
		return
	}

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
	} else if !strings.Contains(data, "Pritunl : true") {
		err = CopyScutilKey("Setup", serviceKey, restoreKey)
		if err != nil {
			return
		}
	}

	return
}

func GetScutilConnIds() (ids []string, err error) {
	ids = []string{}

	cmd := command.Command("/usr/sbin/scutil")
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

	cmd := command.Command("/usr/sbin/scutil")
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

	cmd = command.Command("/usr/sbin/scutil")
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
	logrus.Info("utils: Reseting networking")

	networkResetLock.Lock()
	defer networkResetLock.Unlock()

	switch runtime.GOOS {
	case "windows":
		command.Command("netsh", "interface", "ip", "delete",
			"destinationcache").Run()
		command.Command("ipconfig", "/release").Run()
		command.Command("ipconfig", "/renew").Run()
		command.Command("arp", "-d", "*").Run()
		command.Command("nbtstat", "-R").Run()
		command.Command("nbtstat", "-RR").Run()
		command.Command("ipconfig", "/flushdns").Run()
		command.Command("nbtstat", "/registerdns").Run()
		break
	case "darwin":
		cmd := command.Command("/usr/sbin/networksetup", "-getcurrentlocation")

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

		err = command.Command(
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

		command.Command("route", "-n", "flush").Run()

		err = command.Command(
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

		command.Command("route", "-n", "flush").Run()

		err = command.Command(
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

		command.Command("route", "-n", "flush").Run()

		err = command.Command(
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
		break
	case "linux":
		output, _ := ExecOutput("/usr/bin/nmcli", "networking")
		if strings.Contains(output, "enabled") {
			command.Command("/usr/bin/nmcli", "connection", "reload").Run()
			command.Command("/usr/bin/nmcli", "networking", "off").Run()
			command.Command("/usr/bin/nmcli", "networking", "on").Run()
		}
		break
	default:
		panic("profile: Not implemented")
	}
}

func ClearDns() {
	if runtime.GOOS != "darwin" {
		return
	}

	logrus.Info("utils: Clearing DNS")

	output, err := ExecCombinedOutputLogged(
		nil,
		"/usr/sbin/networksetup",
		"-listallnetworkservices",
	)
	if err != nil {
		return
	}

	for _, netService := range strings.Split(output, "\n") {
		if netService == "" || strings.Contains(netService, "asterisk") {
			continue
		}

		_, _ = ExecCombinedOutputLogged(
			nil,
			"/usr/sbin/networksetup",
			"-setdnsservers",
			netService,
			"Empty",
		)
	}

	command.Command("dscacheutil", "-flushcache").Run()
	command.Command("killall", "-HUP", "mDNSResponder").Run()
}

func ResetDns() {
	if runtime.GOOS != "darwin" {
		return
	}

	logrus.Info("utils: Reseting DNS")

	networkResetLock.Lock()
	defer networkResetLock.Unlock()

	_ = RefreshScutilDns()
}

func ClearDNSCache() {
	macDnsLock.Lock()
	defer macDnsLock.Unlock()

	switch runtime.GOOS {
	case "windows":
		command.Command("ipconfig", "/flushdns").Run()
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
				command.Command("ipconfig", "/flushdns").Run()
			}
		}()
		break
	case "darwin":
		command.Command("dscacheutil", "-flushcache").Run()
		command.Command("killall", "-HUP", "mDNSResponder").Run()
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
				command.Command("dscacheutil", "-flushcache").Run()
				command.Command("killall", "-HUP", "mDNSResponder").Run()
			}
		}()
		break
	case "linux":
		command.Command("systemd-resolve", "--flush-caches").Run()
		command.Command("resolvectl", "--flush-caches").Run()
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
				command.Command("systemd-resolve", "--flush-caches").Run()
			}
		}()
		break
	default:
		panic("profile: Not implemented")
	}
}

func ClearDNSCacheFast() {
	macDnsLock.Lock()
	defer macDnsLock.Unlock()

	switch runtime.GOOS {
	case "windows":
		command.Command("ipconfig", "/flushdns").Run()
		break
	case "darwin":
		command.Command("dscacheutil", "-flushcache").Run()
		command.Command("killall", "-HUP", "mDNSResponder").Run()
		break
	case "linux":
		command.Command("systemd-resolve", "--flush-caches").Run()
		command.Command("resolvectl", "--flush-caches").Run()
		break
	default:
		panic("profile: Not implemented")
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

func GetWinDrive() string {
	systemDrv := os.Getenv("SYSTEMDRIVE")
	if systemDrv == "" {
		return "C:\\"
	}
	return systemDrv + "\\"
}

func GetAuthPath() (pth string) {
	if constants.Development {
		pth = filepath.Join(GetRootDir(), "..", "dev")

		_ = os.MkdirAll(pth, 0755)

		pth = filepath.Join(pth, "auth")
		return
	}

	switch runtime.GOOS {
	case "windows":
		pth = filepath.Join(GetWinDrive(), "ProgramData", "Pritunl")

		_ = platform.MkdirReadSecure(pth)

		pth = filepath.Join(pth, "auth")
		break
	case "linux", "darwin":
		pth = filepath.Join(string(filepath.Separator),
			"var", "run", "pritunl.auth")
		break
	default:
		panic("profile: Not implemented")
	}

	return
}

func GetLogPath() (pth string) {
	if constants.Development {
		pth = filepath.Join(GetRootDir(), "..", "dev", "log")

		_ = os.MkdirAll(pth, 0755)

		pth = filepath.Join(pth, "pritunl-client.log")
		return
	}

	switch runtime.GOOS {
	case "windows":
		pth = filepath.Join(GetWinDrive(), "ProgramData", "Pritunl")

		_ = platform.MkdirReadSecure(pth)

		pth = filepath.Join(pth, "pritunl-client.log")
		break
	case "linux", "darwin":
		pth = filepath.Join(string(filepath.Separator),
			"var", "log", "pritunl-client.log")
		break
	default:
		panic("profile: Not implemented")
	}

	return
}

func GetLogPath2() (pth string) {
	if constants.Development {
		pth = filepath.Join(GetRootDir(), "..", "dev", "log")

		_ = os.MkdirAll(pth, 0755)

		pth = filepath.Join(pth, "pritunl-client.log.1")
		return
	}

	switch runtime.GOOS {
	case "windows":
		pth = filepath.Join(GetWinDrive(), "ProgramData", "Pritunl")

		_ = platform.MkdirReadSecure(pth)

		pth = filepath.Join(pth, "pritunl-client.log.1")
		break
	case "linux", "darwin":
		pth = filepath.Join(string(filepath.Separator),
			"var", "log", "pritunl-client.log.1")
		break
	default:
		panic("profile: Not implemented")
	}

	return
}

func InitTempDir() (err error) {
	if constants.Development {
		pth := filepath.Join(GetRootDir(), "..", "dev", "tmp")
		err = os.MkdirAll(pth, 0755)
		if err != nil {
			err = &IoError{
				errors.Wrap(err, "utils: Failed to create temp directory"),
			}
			return
		}
	} else if runtime.GOOS != "windows" {
		pth := filepath.Join(string(filepath.Separator), "tmp", "pritunl")

		_ = os.RemoveAll(pth)
		err = platform.MkdirSecure(pth)
		if err != nil {
			err = &IoError{
				errors.Wrap(err, "utils: Failed to create temp directory"),
			}
			return
		}
	}

	return
}

func GetTempDir() (pth string, err error) {
	if constants.Development {
		pth = filepath.Join(GetRootDir(), "..", "dev", "tmp")
		err = os.MkdirAll(pth, 0755)
		return
	}

	if runtime.GOOS == "windows" {
		pth = filepath.Join(GetWinDrive(), "ProgramData", "Pritunl", "Temp")
		err = platform.MkdirSecure(pth)
		if err != nil {
			err = &IoError{
				errors.Wrap(
					err, "utils: Failed to create temp directory"),
			}
			return
		}
	} else {
		pth = filepath.Join(string(filepath.Separator), "tmp", "pritunl")
		err = platform.MkdirSecure(pth)
		if err != nil {
			err = &IoError{
				errors.Wrap(
					err, "utils: Failed to create temp directory"),
			}
			return
		}
	}

	return
}

func GetPidPath() (pth string) {
	if constants.Development {
		pth = filepath.Join(GetRootDir(), "..", "dev")

		_ = os.MkdirAll(pth, 0755)

		pth = filepath.Join(pth, "pritunl.pid")
		return
	}

	switch runtime.GOOS {
	case "linux", "darwin":
		pth = filepath.Join(string(filepath.Separator),
			"var", "run", "pritunl.pid")
		break
	default:
		panic("profile: Not implemented")
	}

	return
}

func PidInit() (err error) {
	if runtime.GOOS == "windows" {
		return
	}

	pth := GetPidPath()
	pid := 0

	data, err := ioutil.ReadFile(pth)
	if err != nil {
		if !os.IsNotExist(err) {
			err = errortypes.ReadError{
				errors.Wrapf(err, "utils: Failed to read %s", pth),
			}
			return
		}
		err = nil
	} else {
		pidStr := strings.TrimSpace(string(data))
		if pidStr != "" {
			pid, _ = strconv.Atoi(pidStr)
		}
	}

	_ = os.Remove(pth)
	err = ioutil.WriteFile(
		pth,
		[]byte(strconv.Itoa(os.Getpid())),
		0644,
	)
	if err != nil {
		err = errortypes.WriteError{
			errors.Wrapf(err, "utils: Failed to write pid"),
		}
		return
	}

	if pid != 0 {
		proc, e := os.FindProcess(pid)
		if e == nil {
			proc.Signal(os.Interrupt)

			done := false

			go func() {
				defer func() {
					recover()
				}()

				time.Sleep(5 * time.Second)

				if done {
					return
				}
				proc.Kill()
			}()

			proc.Wait()
			done = true

			time.Sleep(2 * time.Second)
		}
	}

	return
}

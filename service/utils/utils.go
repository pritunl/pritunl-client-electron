// Miscellaneous utils.
package utils

import (
	"bufio"
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"github.com/dropbox/godropbox/errors"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

type Interface struct {
	Id   string
	Name string
}

func GetTapInterfaces() (interfaces []Interface, err error) {
	interfaces = []Interface{}

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
				intf := Interface{
					Id:   intAddr,
					Name: intName,
				}
				interfaces = append(interfaces, intf)
				intName = ""
			}
		}
	}

	return
}

func ResetNetworking() {
	if runtime.GOOS != "windows" {
		return
	}

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

func GetLogPath() (pth string) {
	if runtime.GOOS == "windows" {
		pth = filepath.Join("C:", "ProgramData", "Pritunl")

		err := os.MkdirAll(pth, 0700)
		if err != nil {
			err = &IoError{
				errors.Wrap(err, "utils: Failed to create log directory"),
			}
			panic(err)
		}

		pth = filepath.Join("C:", "ProgramData", "Pritunl", "pritunl.log")
	} else {
		pth = filepath.Join(string(filepath.Separator),
			"var", "log", "pritunl.log")
	}

	return
}

func GetTempDir() (pth string, err error) {
	if runtime.GOOS == "windows" {
		pth = filepath.Join("C:", "ProgramData", "Pritunl")
	} else {
		pth = filepath.Join(string(filepath.Separator), "tmp", "pritunl")
	}

	err = os.MkdirAll(pth, 0700)
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

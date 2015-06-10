package utils

import (
	"github.com/dropbox/godropbox/errors"
	"os/exec"
	"strings"
	"runtime"
)

func UpdateAdapters() (adapUsed int, adapTotal int, err error) {
	if runtime.GOOS == "linux" {
		adapUsed = 0
		adapTotal = 100
		return
	}

	output, err := exec.Command("ipconfig", "/all").Output()
	if err != nil {
		err = &CommandError{
			errors.Wrap(err, "Update tuntap adapters failed"),
		}
		return
	}

	adap := false
	adapDisc := false
	lines := strings.Split(string(output), "\n")

	for _, line := range lines {
		line = strings.Trim(line, "\r")

		if line == "" {
			if adap {
				adapTotal += 1
				if !adapDisc {
					adapUsed += 1
				}
			}
			adap = false
			adapDisc = false
		} else if strings.Contains(line, "TAP-Windows Adapter V9") {
			adap = true
		} else if strings.Contains(line, "Media disconnected") {
			adapDisc = true
		}
	}

	return
}

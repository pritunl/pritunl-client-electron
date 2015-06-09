package utils

import (
	"github.com/dropbox/godropbox/errors"
	"os/exec"
)

func UpdateAdapters() (output []byte, err error) {
	output, err = exec.Command("ipconfig", "/all").Output()
	if err != nil {
		err = &CommandError{
			errors.Wrap(err, "Update tuntap adapters failed"),
		}
		return
	}

	return
}

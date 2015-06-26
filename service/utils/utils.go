// Miscellaneous utils.
package utils

import (
	"crypto/rand"
	"encoding/hex"
	"github.com/dropbox/godropbox/errors"
	"os"
	"path/filepath"
	"runtime"
)

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

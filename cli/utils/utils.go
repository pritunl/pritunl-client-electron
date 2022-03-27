package utils

import (
	"crypto/rand"
	"encoding/hex"
	"os"
	"path/filepath"
	"runtime"

	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/cli/constants"
	"github.com/pritunl/pritunl-client-electron/cli/errortypes"
)

func Uuid() (id string) {
	idByte := make([]byte, 16)

	_, err := rand.Read(idByte)
	if err != nil {
		err = &errortypes.ReadError{
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
	if constants.Development {
		pth = filepath.Join(GetRootDir(), "..", "dev")

		err := os.MkdirAll(pth, 0755)
		if err != nil {
			err = &errortypes.ReadError{
				errors.Wrap(err, "utils: Failed to create dev directory"),
			}
			panic(err)
		}

		pth = filepath.Join(pth, "auth")

		return
	}

	switch runtime.GOOS {
	case "windows":
		pth = filepath.Join("C:\\", "ProgramData", "Pritunl", "auth")
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

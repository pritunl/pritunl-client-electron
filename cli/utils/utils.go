package utils

import (
	"crypto/rand"
	"encoding/hex"
	"os"
	"path/filepath"
	"runtime"

	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/cli/errortypes"
	"github.com/pritunl/pritunl-client-electron/service/constants"
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
		pth = filepath.Join("C:\\", "ProgramData", "Pritunl")

		err := os.MkdirAll(pth, 0755)
		if err != nil {
			err = &errortypes.ReadError{
				errors.Wrap(err, "utils: Failed to create data directory"),
			}
			panic(err)
		}

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

		err := os.MkdirAll(pth, 0755)
		if err != nil {
			err = &errortypes.ReadError{
				errors.Wrap(err, "utils: Failed to create dev directory"),
			}
			panic(err)
		}

		pth = filepath.Join(pth, "pritunl-client.log")

		return
	}

	switch runtime.GOOS {
	case "windows":
		pth = filepath.Join("C:\\", "ProgramData", "Pritunl")

		err := os.MkdirAll(pth, 0755)
		if err != nil {
			err = &errortypes.ReadError{
				errors.Wrap(err, "utils: Failed to create data directory"),
			}
			panic(err)
		}

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

		err := os.MkdirAll(pth, 0755)
		if err != nil {
			err = &errortypes.ReadError{
				errors.Wrap(err, "utils: Failed to create dev directory"),
			}
			panic(err)
		}

		pth = filepath.Join(pth, "pritunl.log.1")

		return
	}

	switch runtime.GOOS {
	case "windows":
		pth = filepath.Join("C:\\", "ProgramData", "Pritunl")

		err := os.MkdirAll(pth, 0755)
		if err != nil {
			err = &errortypes.ReadError{
				errors.Wrap(err, "utils: Failed to create data directory"),
			}
			panic(err)
		}

		pth = filepath.Join(pth, "pritunl.log.1")
		break
	case "darwin":
		pth = filepath.Join(string(os.PathSeparator), "Applications",
			"Pritunl.app", "Contents", "Resources", "pritunl.log.1")
		break
	case "linux":
		pth = filepath.Join(string(filepath.Separator),
			"var", "log", "pritunl.log.1")
		break
	default:
		panic("profile: Not implemented")
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
		pth = filepath.Join("C:\\", "ProgramData", "Pritunl")

		err = os.MkdirAll(pth, 0755)
		if err != nil {
			err = &errortypes.ReadError{
				errors.Wrap(
					err, "utils: Failed to create temp directory"),
			}
			return
		}
	} else {
		pth = filepath.Join(string(filepath.Separator), "tmp", "pritunl")
		if _, err = os.Stat(pth); !os.IsNotExist(err) {
			err = os.Chown(pth, os.Getuid(), os.Getuid())
			if err != nil {
				err = &errortypes.ReadError{
					errors.Wrap(
						err, "utils: Failed to chown temp directory"),
				}
				return
			}

			err = os.Chmod(pth, 0700)
			if err != nil {
				err = &errortypes.ReadError{
					errors.Wrap(
						err, "utils: Failed to chmod temp directory"),
				}
				return
			}
		} else {
			err = os.MkdirAll(pth, 0700)
			if err != nil {
				err = &errortypes.ReadError{
					errors.Wrap(
						err, "utils: Failed to create temp directory"),
				}
				return
			}
		}
	}

	return
}

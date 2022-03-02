package platform

import (
	"os"

	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/errortypes"
)

func MkdirSecure(pth string) (err error) {
	if _, err = os.Stat(pth); !os.IsNotExist(err) {
		err = os.Chown(pth, os.Getuid(), os.Getuid())
		if err != nil {
			err = &errortypes.ReadError{
				errors.Wrap(err, "utils: Failed to chown directory"),
			}
			return
		}

		err = os.Chmod(pth, 0700)
		if err != nil {
			err = &errortypes.ReadError{
				errors.Wrap(err, "utils: Failed to chmod directory"),
			}
			return
		}
	} else {
		err = os.MkdirAll(pth, 0700)
		if err != nil {
			err = &errortypes.ReadError{
				errors.Wrap(err, "utils: Failed to create directory"),
			}
			return
		}
	}

	return
}

package auth

import (
	"io/ioutil"
	"os"
	"strings"

	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/utils"
)

var Key = ""

func Init() (err error) {
	pth := utils.GetAuthPath()

	if _, e := os.Stat(pth); os.IsNotExist(e) {
		Key, err = utils.RandStr(64)
		if err != nil {
			return
		}

		err = ioutil.WriteFile(pth, []byte(Key), os.FileMode(0644))
		if err != nil {
			err = &WriteError{
				errors.Wrap(err, "auth: Failed to auth key"),
			}
			return
		}
	} else {
		data, e := ioutil.ReadFile(pth)
		if e != nil {
			err = &WriteError{
				errors.Wrap(e, "auth: Failed to auth key"),
			}
			return
		}

		Key = strings.TrimSpace(string(data))

		if Key == "" {
			err = os.Remove(pth)
			if err != nil {
				err = &WriteError{
					errors.Wrap(err, "auth: Failed to reset auth key"),
				}
				return
			}
			Init()
		}
	}

	return
}

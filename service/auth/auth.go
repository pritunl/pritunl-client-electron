package auth

import (
	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"io/ioutil"
	"os"
	"strings"
)

var Key = ""

func Init() (err error) {
	pth := utils.GetAuthPath()

	if _, e := os.Stat(pth); os.IsNotExist(e) {
		Key = utils.Uuid()

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

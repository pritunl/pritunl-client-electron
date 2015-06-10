package profile

import (
	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"io/ioutil"
	"os"
	"path/filepath"
)

type Profile struct {
	Id   string
	Data string
}

func (p *Profile) write() (pth string, err error) {
	pth = filepath.Join(utils.GetTempDir(), p.Id)

	err = ioutil.WriteFile(pth, []byte(p.Data), os.FileMode(0600))
	if err != nil {
		&WriteError{
			errors.Wrap(err, "profile: Failed to write profile"),
		}
	}

	return
}

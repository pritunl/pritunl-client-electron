package upgrade

import (
	"io/fs"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/errortypes"
	"github.com/pritunl/pritunl-client-electron/service/platform"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"github.com/sirupsen/logrus"
)

func WindowsUpgrade() (err error) {
	sourceDir := filepath.Join("C:\\", "ProgramData", "Pritunl")
	destDir := filepath.Join("C:\\", "Windows", "System32", "Pritunl")
	checkPath := filepath.Join(destDir, "upgraded")

	exists, err := utils.Exists(checkPath)
	if err != nil {
		return
	}

	if exists {
		return
	}

	logrus.Info("upgrade: Upgrading service profiles")

	files, err := ioutil.ReadDir(sourceDir)
	if err != nil {
		if os.IsNotExist(err) {
			files = []fs.FileInfo{}
			err = nil
		} else {
			err = &errortypes.ReadError{
				errors.Wrap(err, "sprofile: Failed to read profiles directory"),
			}
			return
		}
	}

	err = platform.MkdirSecure(destDir)
	if err != nil {
		return
	}

	for _, file := range files {
		name := file.Name()
		srcPth := path.Join(sourceDir, name)
		destPth := path.Join(destDir, name)

		if !strings.HasPrefix(name, ".conf") {
			continue
		}

		err = utils.Copy(srcPth, destPth)
		if err != nil {
			return
		}
	}

	err = utils.CreateWrite(checkPath, "1", 0644)
	if err != nil {
		return
	}

	return
}

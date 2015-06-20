package autoclean

import (
	"github.com/Sirupsen/logrus"
	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"io/ioutil"
	"os"
	"path/filepath"
	"runtime"
	"time"
)

const (
	pathSep = string(os.PathSeparator)
)

func clean() (err error) {
	paths := []string{
		filepath.Join(pathSep, "usr", "local", "bin", "pritunl-openvpn"),
		filepath.Join(pathSep, "private", "var", "db", "receipts",
			"com.pritunl.pkg.Pritunl.bom"),
		filepath.Join(pathSep, "private", "var", "db", "receipts",
			"com.pritunl.pkg.Pritunl.plist"),
		filepath.Join(pathSep, "private", "tmp", "pritunl"),
		filepath.Join(pathSep, "Applications", "Pritunl.app"),
	}

	homesPath := filepath.Join(pathSep, "Users")
	homes, err := ioutil.ReadDir(homesPath)
	if err != nil {
		err = &ParseError{
			errors.Wrap(err, "autoclean: Failed to read home directories"),
		}
		return
	}

	for _, home := range homes {
		if !home.IsDir() {
			continue
		}

		paths = append(paths, filepath.Join(homesPath, home.Name(),
			"Library", "Application Support", "pritunl"))
		paths = append(paths, filepath.Join(homesPath, home.Name(),
			"Library", "Caches", "pritunl"))
		paths = append(paths, filepath.Join(homesPath, home.Name(),
			"Library", "Preferences", "com.electron.pritunl.plist"))
	}

	paths = append(paths, filepath.Join(pathSep, "usr", "local",
		"bin", "pritunl-service"))
	paths = append(paths, filepath.Join(pathSep, "Library", "LaunchDaemons",
		"com.pritunl.service.plist"))

	for _, path := range paths {
		if len(path) < 20 {
			panic("autoclean: Bad path " + path)
		}

		err = os.RemoveAll(path)
		if err != nil {
			err = &RemoveError{
				errors.Wrap(err, "autoclean: Failed to remove file"),
			}
		}
	}

	return
}

func CheckAndClean() (err error) {
	root := utils.GetRootDir()
	if runtime.GOOS != "darwin" || root != "/usr/local/bin" {
		return
	}

	path := filepath.Join(pathSep, "Applications", "Pritunl.app")
	if _, e := os.Stat(path); !os.IsNotExist(e) {
		return
	}

	err = clean()
	if err != nil {
		return
	}

	os.Exit(0)

	return
}

func CheckAndCleanWatch() {
	root := utils.GetRootDir()
	if runtime.GOOS != "darwin" || root != "/usr/local/bin" {
		return
	}

	go func() {
		for i := 0; i < 30; i++ {
			time.Sleep(10 * time.Second)

			err := CheckAndClean()
			if err != nil {
				logrus.WithFields(logrus.Fields{
					"error": err,
				}).Error("autoclean: Failed to run check and clean")
				return
			}
		}
	}()
}

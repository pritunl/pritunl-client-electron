package autoclean

import (
	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"io/ioutil"
	"os"
	"path/filepath"
	"runtime"
)

const (
	pathSep = string(os.PathSeparator)
)

func clean() (err error) {
	paths := []string{
		filepath.Join(pathSep, "Library", "LaunchDaemons",
			"com.pritunl.service.plist"),
		filepath.Join(pathSep, "Library", "LaunchDaemons",
			"com.pritunl.tuntaposx.pritunl-tap.plist"),
		filepath.Join(pathSep, "Library", "LaunchDaemons",
			"com.pritunl.tuntaposx.pritunl-tun.plist"),
		filepath.Join(pathSep, "usr", "local", "bin", "pritunl-service"),
		filepath.Join(pathSep, "usr", "local", "bin", "pritunl-openvpn"),
		filepath.Join(pathSep, "Library", "Extensions", "pritunl-tap.kext"),
		filepath.Join(pathSep, "Library", "Extensions", "pritunl-tun.kext"),
		filepath.Join(pathSep, "private", "var", "db", "receipts",
			"com.pritunl.pkg.Pritunl.bom"),
		filepath.Join(pathSep, "private", "var", "db", "receipts",
			"com.pritunl.pkg.Pritunl.plist"),
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
			return
		}

		paths = append(paths, filepath.Join(homesPath, home.Name(),
			"Library", "Application Support", "pritunl"))
	}

	for _, path := range paths {
		if len(path) < 30 {
			panic("autoclean: Bad path " + path)
		}

		err = os.RemoveAll(path)
	}

	return
}

func CheckAndClean() (err error) {
	root := utils.GetRootDir()
	if runtime.GOOS != "darwin" || root != "/usr/local/bin" {
		return
	}

	path := filepath.Join(pathSep, "Applications", "Pritunl.app")
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return
	}

	err = clean()
	if err != nil {
		return
	}

	os.Exit(0)

	return
}

// For OS X to detect removal of Pritunl.app and auto uninstall all files.
package autoclean

import (
	"github.com/Sirupsen/logrus"
	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"runtime/debug"
	"time"
)

const (
	pathSep = string(os.PathSeparator)
)

func clean() (err error) {
	exec.Command("kextunload", "-b", "net.sf.tuntaposx.tap").Run()
	exec.Command("kextunload", "-b", "net.sf.tuntaposx.tun").Run()

	paths := []string{
		filepath.Join(pathSep, "usr", "local", "bin", "pritunl-openvpn"),
		filepath.Join(pathSep, "private", "var", "db", "receipts",
			"com.pritunl.pkg.Pritunl.bom"),
		filepath.Join(pathSep, "private", "var", "db", "receipts",
			"com.pritunl.pkg.Pritunl.plist"),
		filepath.Join(pathSep, "var", "lib", "pritunl"),
		filepath.Join(pathSep, "var", "log", "pritunl.log"),
		filepath.Join(pathSep, "Applications", "Pritunl.app"),
		filepath.Join(pathSep, "Library", "Extensions", "tap.kext"),
		filepath.Join(pathSep, "Library", "Extensions", "tun.kext"),
		filepath.Join(pathSep, "Library", "LaunchDaemons",
			"net.sf.tuntaposx.tap.plist"),
		filepath.Join(pathSep, "Library", "LaunchDaemons",
			"net.sf.tuntaposx.tun.plist"),
		filepath.Join(pathSep, "Library", "LaunchAgents",
			"com.pritunl.client.plist"),
		filepath.Join(pathSep, "Library", "LaunchDaemons",
			"com.pritunl.service.plist"),
		filepath.Join(pathSep, "usr", "local", "bin", "pritunl-service"),
	}

	for _, path := range paths {
		err = os.RemoveAll(path)
		if err != nil {
			err = &RemoveError{
				errors.Wrap(err, "autoclean: Failed to remove file"),
			}
		}
	}

	return
}

// Check for Pritunl.app and uninstall if missing
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

// Watch for Pritunl.app removal for next 10 minutes and uninstall if missing
func CheckAndCleanWatch() {
	root := utils.GetRootDir()
	if runtime.GOOS != "darwin" || root != "/usr/local/bin" {
		return
	}

	go func() {
		defer func() {
			panc := recover()
			if panc != nil {
				logrus.WithFields(logrus.Fields{
					"stack": string(debug.Stack()),
					"panic": panc,
				}).Error("autoclean: Panic")
				panic(panc)
			}
		}()

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

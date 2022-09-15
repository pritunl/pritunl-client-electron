package setup

import (
	"path"
	"strings"

	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/command"
	"github.com/pritunl/pritunl-client-electron/service/errortypes"
)

func TunTapPath() string {
	return path.Join(RootDir(), "tuntap")
}

func TapCtlPath() string {
	return path.Join(TunTapPath(), "tapctl.exe")
}

func TunTapGet() (adpaters []string, err error) {
	output, err := ExecOutput(
		TunTapPath(),
		TapCtlPath(),
		"list",
	)
	if err != nil {
		return
	}

	adpaters = []string{}
	for _, line := range strings.Split(output, "\n") {
		lines := strings.Fields(line)
		if len(lines) < 2 {
			continue
		}

		name := strings.ToLower(lines[1])

		if name != "ethernet" && name != "local" && name != "pritunl" {
			continue
		}

		adpaters = append(adpaters, lines[0])
	}

	return
}

func TunTapInstall() (err error) {
	cmd := command.Command(
		"pnputil.exe",
		"-a", "oemvista.inf",
		"-i",
	)
	cmd.Dir = TunTapPath()

	err = cmd.Run()
	if err != nil {
		err = &errortypes.ExecError{
			errors.Wrap(err, "setup: Driver setup error"),
		}
		return
	}

	return
}

func TunTapClean() (err error) {
	adapters, err := TunTapGet()
	if err != nil {
		return
	}

	for _, adapter := range adapters {
		cmd := command.Command(
			TapCtlPath(),
			"delete",
			adapter,
		)
		cmd.Dir = TunTapPath()

		err = cmd.Run()
		if err != nil {
			err = &errortypes.ExecError{
				errors.Wrap(err, "setup: Driver removal error"),
			}
			return
		}
	}

	return
}

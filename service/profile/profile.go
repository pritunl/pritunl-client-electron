package profile

import (
	"bufio"
	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/event"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"io"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
)

type OutputData struct {
	ProfileId string `json:"profile_id"`
	Output    string `json:"output"`
}

type Profile struct {
	Id       string
	Data     string
	Password string
}

func (p *Profile) write() (pth string, err error) {
	rootDir, err := utils.GetTempDir()
	if err != nil {
		return
	}

	pth = filepath.Join(rootDir, p.Id)

	err = ioutil.WriteFile(pth, []byte(p.Data), os.FileMode(0600))
	if err != nil {
		err = &WriteError{
			errors.Wrap(err, "profile: Failed to write profile"),
		}
		return
	}

	return
}

func (p *Profile) pushOutput(output string) {
	evt := &event.Event{
		Type: "output",
		Data: &OutputData{
			ProfileId: p.Id,
			Output:    output,
		},
	}
	evt.Init()

	return
}

func (p *Profile) Start() (err error) {
	confPath, err := p.write()
	if err != nil {
		return
	}

	cmd := exec.Command(getOpenvpnPath(), "--config", confPath)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		err = &ExecError{
			errors.Wrap(err, "profile: Failed to get stdout"),
		}
		return
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		err = &ExecError{
			errors.Wrap(err, "profile: Failed to get stderr"),
		}
		return
	}

	go func() {
		out := bufio.NewReader(stdout)
		for {
			line, _, err := out.ReadLine()
			if err != nil {
				if err == io.EOF {
					return
				}

				err = &ExecError{
					errors.Wrap(err, "profile: Failed to read stdout"),
				}
				panic(err)
			}
			p.pushOutput(string(line))
		}
	}()

	go func() {
		out := bufio.NewReader(stderr)
		for {
			line, _, err := out.ReadLine()
			if err != nil {
				if err == io.EOF {
					return
				}

				err = &ExecError{
					errors.Wrap(err, "profile: Failed to read stderr"),
				}
				panic(err)
			}
			p.pushOutput(string(line))
		}
	}()

	err = cmd.Start()
	if err != nil {
		err = &ExecError{
			errors.Wrap(err, "profile: Failed to start openvpn"),
		}
		return
	}

	err = cmd.Wait()
	if err != nil {
		err = &ExecError{
			errors.Wrap(err, "profile: Openvpn error occurred"),
		}
		return
	}

	return
}

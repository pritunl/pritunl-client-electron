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
	"strings"
	"time"
)

const (
	connTimeout = 30 * time.Second
)

var (
	Profiles = map[string]*Profile{}
)

type OutputData struct {
	Id     string `json:"id"`
	Output string `json:"output"`
}

type Profile struct {
	cmd        *exec.Cmd `json:"-"`
	Id         string    `json:"id"`
	Data       string    `json:"-"`
	Password   string    `json:"-"`
	Status     string    `json:"status"`
	Timestamp  int64     `json:"timestamp"`
	ServerAddr string    `json:"server_addr"`
	ClientAddr string    `json:"client_addr"`
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

func (p *Profile) update() {
	evt := event.Event{
		Type: "update",
		Data: p,
	}
	evt.Init()
}

func (p *Profile) pushOutput(output string) {
	evt := &event.Event{
		Type: "output",
		Data: &OutputData{
			Id:     p.Id,
			Output: output,
		},
	}
	evt.Init()

	return
}

func (p *Profile) parseLine(line string) {
	p.pushOutput(string(line))

	if strings.Contains(line, "Initialization Sequence Completed") {
		p.Status = "connected"
		p.update()
	} else if strings.Contains(line, "Inactivity timeout") {
		p.Status = "reconnecting"
		p.update()
	} else if strings.Contains(line, "AUTH_FAILED") || strings.Contains(
		line, "auth-failure") {

		evt := event.Event{
			Type: "auto_error",
			Data: p,
		}
		evt.Init()
	} else if strings.Contains(line, "link remote:") {
		sIndex := strings.LastIndex(line, "]") + 1
		eIndex := strings.LastIndex(line, ":")

		p.ServerAddr = line[sIndex:eIndex]
		p.update()
	} else if strings.Contains(line, "network/local/netmask") {
		eIndex := strings.LastIndex(line, "/")
		line = line[:eIndex]
		sIndex := strings.LastIndex(line, "/") + 1

		p.ClientAddr = line[sIndex:]
		p.update()
	}
}

func (p *Profile) Start() (err error) {
	p.Status = "connecting"
	p.Timestamp = time.Now().Unix()

	Profiles[p.Id] = p

	confPath, err := p.write()
	if err != nil {
		return
	}

	p.update()

	cmd := exec.Command(getOpenvpnPath(), "--config", confPath)
	p.cmd = cmd

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
			p.parseLine(string(line))
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
			p.parseLine(string(line))
		}
	}()

	err = cmd.Start()
	if err != nil {
		err = &ExecError{
			errors.Wrap(err, "profile: Failed to start openvpn"),
		}
		return
	}

	running := true
	go func() {
		cmd.Wait()

		running = false

		p.Status = "disconnected"
		p.Timestamp = 0
		p.ClientAddr = ""
		p.ServerAddr = ""
		p.update()

		delete(Profiles, p.Id)
	}()

	go func() {
		time.Sleep(connTimeout)
		if p.Status != "connected" && running {
			cmd.Process.Kill()

			evt := event.Event{
				Type: "timeout_error",
				Data: p,
			}
			evt.Init()
		}
	}()

	return
}

func (p *Profile) Stop() (err error) {
	if p.cmd == nil {
		return
	}

	err = p.cmd.Process.Kill()
	if err != nil {
		err = &ExecError{
			errors.Wrap(err, "profile: Failed to stop openvpn"),
		}
		return
	}

	return
}

// Stores conf for OpenVPN and state of process.
package profile

import (
	"bufio"
	"github.com/Sirupsen/logrus"
	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/event"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"io"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"
)

const (
	connTimeout = 30 * time.Second
)

var (
	Profiles     = map[string]*Profile{}
	Ping         = time.Now()
	profilesLock = sync.Mutex{}
)

func init() {
	go func() {
		if time.Since(Ping) > 1*time.Minute {
			for _, prfl := range Profiles {
				prfl.Stop()
			}
		}

		time.Sleep(2 * time.Minute)
	}()
}

type OutputData struct {
	Id     string `json:"id"`
	Output string `json:"output"`
}

type Profile struct {
	cmd        *exec.Cmd `json:"-"`
	Id         string    `json:"id"`
	Data       string    `json:"-"`
	Username   string    `json:"-"`
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

func (p *Profile) writeAuth() (pth string, err error) {
	rootDir, err := utils.GetTempDir()
	if err != nil {
		return
	}

	pth = filepath.Join(rootDir, p.Id + ".auth")

	err = ioutil.WriteFile(pth, []byte(p.Username + "\n" + p.Password + "\n"),
		os.FileMode(0600))
	if err != nil {
		err = &WriteError{
			errors.Wrap(err, "profile: Failed to write profile auth"),
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

	status := GetStatus()

	if status {
		evt := event.Event{
			Type: "connected",
		}
		evt.Init()
	} else {
		evt := event.Event{
			Type: "disconnected",
		}
		evt.Init()
	}
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
	} else if strings.Contains(line, "ifconfig") && strings.Contains(
		line, "netmask") {

		sIndex := strings.Index(line, "ifconfig") + 9
		eIndex := strings.Index(line, "netmask")
		line = line[sIndex:eIndex]

		split := strings.Split(line, " ")
		if len(split) > 2 {
			p.ClientAddr = split[1]
			p.update()
		}
	} else if strings.Contains(line, "ip addr add dev") {
		sIndex := strings.Index(line, "ip addr add dev") + 16
		eIndex := strings.Index(line, "broadcast")
		line = line[sIndex:eIndex]
		split := strings.Split(line, " ")

		if len(split) > 1 {
			split := strings.Split(split[1], "/")
			if len(split) > 1 {
				p.ClientAddr = split[0]
				p.update()
			}
		}
	}
}

func (p *Profile) clearStatus(start time.Time) {
	go func() {
		diff := time.Since(start)
		if diff < 3*time.Second {
			time.Sleep((5 * time.Second) - diff)
		}

		p.Status = "disconnected"
		p.Timestamp = 0
		p.ClientAddr = ""
		p.ServerAddr = ""
		p.update()
	}()
}

func (p *Profile) Start(timeout bool) (err error) {
	start := time.Now()

	p.Status = "connecting"
	p.Timestamp = start.Unix()

	profilesLock.Lock()
	_, ok := Profiles[p.Id]
	if ok {
		profilesLock.Unlock()
		return
	}
	Profiles[p.Id] = p
	profilesLock.Unlock()

	confPath, err := p.write()
	if err != nil {
		p.clearStatus(start)
		return
	}

	var authPath string
	if p.Username != "" || p.Password != "" {
		authPath, err = p.writeAuth()
		if err != nil {
			p.clearStatus(start)
			return
		}
	}

	p.update()

	args := []string{
		"--config", confPath,
		"--script-security", "1",
		"--verb", "2",
	}

	if authPath != "" {
		args = append(args, "--auth-user-pass", authPath)
	}

	cmd := exec.Command(getOpenvpnPath(), args...)
	p.cmd = cmd

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		err = &ExecError{
			errors.Wrap(err, "profile: Failed to get stdout"),
		}
		p.clearStatus(start)
		return
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		err = &ExecError{
			errors.Wrap(err, "profile: Failed to get stderr"),
		}
		p.clearStatus(start)
		return
	}

	go func() {
		out := bufio.NewReader(stdout)
		for {
			line, _, err := out.ReadLine()
			if err != nil {
				if err != io.EOF {
					err = &ExecError{
						errors.Wrap(err, "profile: Failed to read stdout"),
					}
					logrus.WithFields(logrus.Fields{
						"error": err,
					}).Error("profile: Stdout error")
				}

				return
			}
			p.parseLine(string(line))
		}
	}()

	go func() {
		out := bufio.NewReader(stderr)
		for {
			line, _, err := out.ReadLine()
			if err != nil {
				if err != io.EOF {
					err = &ExecError{
						errors.Wrap(err, "profile: Failed to read stderr"),
					}
					logrus.WithFields(logrus.Fields{
						"error": err,
					}).Error("profile: Stderr error")
				}

				return
			}
			p.parseLine(string(line))
		}
	}()

	err = cmd.Start()
	if err != nil {
		err = &ExecError{
			errors.Wrap(err, "profile: Failed to start openvpn"),
		}
		p.clearStatus(start)
		return
	}

	running := true
	go func() {
		cmd.Wait()
		running = false
		p.clearStatus(start)
		delete(Profiles, p.Id)
	}()

	if timeout {
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
	}

	return
}

func (p *Profile) Stop() (err error) {
	if p.cmd == nil {
		return
	}

	if runtime.GOOS != "windows" {
		err = p.cmd.Process.Kill()
		if err != nil {
			err = &ExecError{
				errors.Wrap(err, "profile: Failed to stop openvpn"),
			}
			return
		}

		utils.ResetNetworking()
	} else {
		err = p.cmd.Process.Signal(os.Interrupt)
		if err != nil {
			err = &ExecError{
				errors.Wrap(err, "profile: Failed to interrupt openvpn"),
			}
			return
		}

		go func() {
			time.Sleep(6 * time.Second)
			p.cmd.Process.Kill()
			utils.ResetNetworking()
		}()
	}

	return
}

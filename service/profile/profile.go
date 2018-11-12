// Stores conf for OpenVPN and state of process.
package profile

import (
	"bufio"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha512"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"github.com/Sirupsen/logrus"
	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/command"
	"github.com/pritunl/pritunl-client-electron/service/errortypes"
	"github.com/pritunl/pritunl-client-electron/service/event"
	"github.com/pritunl/pritunl-client-electron/service/token"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"io"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"runtime/debug"
	"strings"
	"sync"
	"time"
)

const (
	connTimeout  = 60 * time.Second
	resetWait    = 3000 * time.Millisecond
	netResetWait = 4000 * time.Millisecond
)

var (
	Profiles = struct {
		sync.RWMutex
		m map[string]*Profile
	}{
		m: map[string]*Profile{},
	}
	Ping = time.Now()
)

type OutputData struct {
	Id     string `json:"id"`
	Output string `json:"output"`
}

type Profile struct {
	state           bool             `json:"-"`
	stateLock       sync.Mutex       `json:"-"`
	stop            bool             `jons:"-"`
	waiters         []chan bool      `json:"-"`
	remPaths        []string         `json:"-"`
	cmd             *exec.Cmd        `json:"-"`
	intf            *utils.Interface `json:"-"`
	lastAuthErr     time.Time        `json:"-"`
	token           *token.Token     `json:"-"`
	Id              string           `json:"id"`
	Data            string           `json:"-"`
	Username        string           `json:"-"`
	Password        string           `json:"-"`
	ServerPublicKey string           `json:"-"`
	Reconnect       bool             `json:"reconnect"`
	Status          string           `json:"status"`
	Timestamp       int64            `json:"timestamp"`
	ServerAddr      string           `json:"server_addr"`
	ClientAddr      string           `json:"client_addr"`
}

type AuthData struct {
	Token     string `json:"token"`
	Password  string `json:"password"`
	Nonce     string `json:"nonce"`
	Timestamp int64  `json:"timestamp"`
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

func (p *Profile) writeUp() (pth string, err error) {
	rootDir, err := utils.GetTempDir()
	if err != nil {
		return
	}

	pth = filepath.Join(rootDir, p.Id+"-up.sh")

	script := ""
	switch runtime.GOOS {
	case "darwin":
		script = upScriptDarwin
		break
	case "linux":
		resolved := true

		resolvData, _ := ioutil.ReadFile("/etc/resolv.conf")
		if resolvData != nil {
			resolvDataStr := string(resolvData)
			if !strings.Contains(resolvDataStr, "systemd-resolved") &&
				!strings.Contains(resolvDataStr, "127.0.0.53") {

				resolved = false
			}
		}

		if resolved {
			script = resolvedScript
		} else {
			script = resolvScript
		}
		break
	default:
		panic("profile: Not implemented")
	}

	err = ioutil.WriteFile(pth, []byte(script), os.FileMode(0755))
	if err != nil {
		err = &WriteError{
			errors.Wrap(err, "profile: Failed to write up script"),
		}
		return
	}

	return
}

func (p *Profile) writeDown() (pth string, err error) {
	rootDir, err := utils.GetTempDir()
	if err != nil {
		return
	}

	pth = filepath.Join(rootDir, p.Id+"-down.sh")

	script := ""
	switch runtime.GOOS {
	case "darwin":
		script = downScriptDarwin
		break
	case "linux":
		resolved := true

		resolvData, _ := ioutil.ReadFile("/etc/resolv.conf")
		if resolvData != nil {
			resolvDataStr := string(resolvData)
			if !strings.Contains(resolvDataStr, "systemd-resolved") &&
				!strings.Contains(resolvDataStr, "127.0.0.53") {

				resolved = false
			}
		}

		if resolved {
			script = resolvedScript
		} else {
			script = resolvScript
		}
		break
	default:
		panic("profile: Not implemented")
	}

	err = ioutil.WriteFile(pth, []byte(script), os.FileMode(0755))
	if err != nil {
		err = &WriteError{
			errors.Wrap(err, "profile: Failed to write down script"),
		}
		return
	}

	return
}

func (p *Profile) writeBlock() (pth string, err error) {
	rootDir, err := utils.GetTempDir()
	if err != nil {
		return
	}

	pth = filepath.Join(rootDir, p.Id+"-block.sh")

	err = ioutil.WriteFile(pth, []byte(blockScript), os.FileMode(0755))
	if err != nil {
		err = &WriteError{
			errors.Wrap(err, "profile: Failed to write block script"),
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

	password := p.Password

	if p.ServerPublicKey != "" {
		block, _ := pem.Decode([]byte(p.ServerPublicKey))

		pub, e := x509.ParsePKCS1PublicKey(block.Bytes)
		if e != nil {
			err = &errortypes.ParseError{
				errors.Wrap(e, "profile: Failed to parse public key"),
			}
			return
		}

		nonce, e := utils.RandStr(32)
		if e != nil {
			err = e
			return
		}

		tokn := token.Get(p.Id, p.ServerPublicKey)
		p.token = tokn

		authToken := ""
		if tokn != nil {
			err = tokn.Update()
			if err != nil {
				return
			}

			authToken = tokn.Token
		}

		authData := &AuthData{
			Token:     authToken,
			Password:  password,
			Nonce:     nonce,
			Timestamp: time.Now().Unix(),
		}

		authDataJson, e := json.Marshal(authData)
		if e != nil {
			err = &errortypes.ParseError{
				errors.Wrap(e, "profile: Failed to encode auth data"),
			}
			return
		}

		ciphertext, e := rsa.EncryptOAEP(
			sha512.New(),
			rand.Reader,
			pub,
			authDataJson,
			[]byte{},
		)
		if e != nil {
			err = &errortypes.WriteError{
				errors.Wrap(e, "profile: Failed to encrypt auth data"),
			}
			return
		}

		ciphertext64 := base64.StdEncoding.EncodeToString(ciphertext)

		password = "<%=RSA_ENCRYPTED=%>" + ciphertext64
	}

	pth = filepath.Join(rootDir, p.Id+".auth")

	err = ioutil.WriteFile(pth, []byte(p.Username+"\n"+password+"\n"),
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
		p.Timestamp = time.Now().Unix() - 5
		p.update()

		tokn := p.token
		if tokn != nil {
			tokn.Valid = true
		}

		go func() {
			defer func() {
				panc := recover()
				if panc != nil {
					logrus.WithFields(logrus.Fields{
						"stack": string(debug.Stack()),
						"panic": panc,
					}).Error("profile: Panic")
					panic(panc)
				}
			}()

			utils.ClearDNSCache()
		}()
	} else if strings.Contains(line, "Inactivity timeout (--inactive)") {
		evt := event.Event{
			Type: "inactive",
			Data: p,
		}
		evt.Init()

		p.stop = true
	} else if strings.Contains(line, "Inactivity timeout") {
		go func() {
			defer func() {
				panc := recover()
				if panc != nil {
					logrus.WithFields(logrus.Fields{
						"stack": string(debug.Stack()),
						"panic": panc,
					}).Error("profile: Panic")
					panic(panc)
				}
			}()

			prfl := p.Copy()

			stop := p.stop

			err := p.Stop()
			if err != nil {
				logrus.WithFields(logrus.Fields{
					"error": err,
				}).Error("profile: Stop error")
				return
			}

			p.Wait()

			if !stop && prfl.Reconnect {
				err = prfl.Start(false)
				if err != nil {
					logrus.WithFields(logrus.Fields{
						"error": err,
					}).Error("profile: Restart error")
					return
				}
			}
		}()
	} else if strings.Contains(
		line, "Can't assign requested address (code=49)") {

		go func() {
			defer func() {
				panc := recover()
				if panc != nil {
					logrus.WithFields(logrus.Fields{
						"stack": string(debug.Stack()),
						"panic": panc,
					}).Error("profile: Panic")
					panic(panc)
				}
			}()

			time.Sleep(3 * time.Second)

			if !p.stop {
				RestartProfiles(true)
			}
		}()
	} else if strings.Contains(line, "AUTH_FAILED") || strings.Contains(
		line, "auth-failure") {

		p.stop = true

		tokn := p.token
		if tokn != nil {
			tokn.Init()
		}

		if time.Since(p.lastAuthErr) > 10*time.Second {
			p.lastAuthErr = time.Now()

			evt := event.Event{
				Type: "auth_error",
				Data: p,
			}
			evt.Init()
		}
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
	if p.intf != nil {
		utils.ReleaseTap(p.intf)
	}

	go func() {
		defer func() {
			panc := recover()
			if panc != nil {
				logrus.WithFields(logrus.Fields{
					"stack": string(debug.Stack()),
					"panic": panc,
				}).Error("profile: Panic")
				panic(panc)
			}
		}()

		diff := time.Since(start)
		if diff < 1*time.Second {
			time.Sleep(1 * time.Second)
		}

		p.Status = "disconnected"
		p.Timestamp = 0
		p.ClientAddr = ""
		p.ServerAddr = ""
		p.update()

		for _, path := range p.remPaths {
			os.Remove(path)
		}

		Profiles.Lock()
		delete(Profiles.m, p.Id)
		if runtime.GOOS == "darwin" && len(Profiles.m) == 0 {
			err := utils.ClearScutilKeys()
			if err != nil {
				logrus.WithFields(logrus.Fields{
					"error": err,
				}).Error("profile: Failed to clear scutil keys")
			}
		}
		Profiles.Unlock()

		p.stateLock.Lock()
		p.state = false
		for _, waiter := range p.waiters {
			waiter <- true
		}
		p.waiters = []chan bool{}
		p.stateLock.Unlock()

		logrus.WithFields(logrus.Fields{
			"profile_id": p.Id,
		}).Info("profile: Disconnected")
	}()
}

func (p *Profile) Copy() (prfl *Profile) {
	prfl = &Profile{
		Id:              p.Id,
		Data:            p.Data,
		Username:        p.Username,
		Password:        p.Password,
		ServerPublicKey: p.ServerPublicKey,
		Reconnect:       p.Reconnect,
	}
	prfl.Init()

	return
}

func (p *Profile) Init() {
	p.Id = FilterStr(p.Id)
	p.stateLock = sync.Mutex{}
	p.waiters = []chan bool{}
}

func (p *Profile) Start(timeout bool) (err error) {
	start := time.Now()
	p.remPaths = []string{}

	p.Status = "connecting"
	p.stateLock.Lock()
	p.state = true
	p.stateLock.Unlock()

	Profiles.RLock()
	n := len(Profiles.m)
	_, ok := Profiles.m[p.Id]
	Profiles.RUnlock()
	if ok {
		return
	}

	logrus.WithFields(logrus.Fields{
		"profile_id": p.Id,
	}).Info("profile: Connecting")

	if runtime.GOOS == "darwin" && n == 0 {
		utils.ClearScutilKeys()
	}

	Profiles.Lock()
	Profiles.m[p.Id] = p
	Profiles.Unlock()

	confPath, err := p.write()
	if err != nil {
		p.clearStatus(start)
		return
	}
	p.remPaths = append(p.remPaths, confPath)

	var authPath string
	if (p.Username != "" && p.Password != "") || p.ServerPublicKey != "" {
		authPath, err = p.writeAuth()
		if err != nil {
			p.clearStatus(start)
			return
		}
		p.remPaths = append(p.remPaths, authPath)
	}

	p.update()

	args := []string{
		"--config", confPath,
		"--verb", "2",
	}

	if runtime.GOOS == "windows" {
		p.intf, err = utils.AcquireTap()
		if err != nil {
			p.clearStatus(start)
			return
		}

		if p.intf != nil {
			args = append(args, "--dev-node", p.intf.Name)
		}
	}

	blockPath, e := p.writeBlock()
	if e != nil {
		err = e
		p.clearStatus(start)
		return
	}
	p.remPaths = append(p.remPaths, blockPath)

	switch runtime.GOOS {
	case "windows":
		args = append(args, "--script-security", "1")
		break
	case "darwin":
		upPath, e := p.writeUp()
		if e != nil {
			err = e
			p.clearStatus(start)
			return
		}
		p.remPaths = append(p.remPaths, upPath)

		downPath, e := p.writeDown()
		if e != nil {
			err = e
			p.clearStatus(start)
			return
		}
		p.remPaths = append(p.remPaths, downPath)

		args = append(args, "--script-security", "2",
			"--up", upPath,
			"--down", downPath,
			"--route-pre-down", blockPath,
			"--tls-verify", blockPath,
			"--ipchange", blockPath,
			"--route-up", blockPath,
		)
		break
	case "linux":
		upPath, e := p.writeUp()
		if e != nil {
			err = e
			p.clearStatus(start)
			return
		}
		p.remPaths = append(p.remPaths, upPath)

		downPath, e := p.writeDown()
		if e != nil {
			err = e
			p.clearStatus(start)
			return
		}
		p.remPaths = append(p.remPaths, downPath)

		args = append(args, "--script-security", "2",
			"--up", upPath,
			"--down", downPath,
			"--route-pre-down", blockPath,
			"--tls-verify", blockPath,
			"--ipchange", blockPath,
			"--route-up", blockPath,
		)
		break
	default:
		panic("profile: Not implemented")
	}

	if authPath != "" {
		args = append(args, "--auth-user-pass", authPath)
	}

	cmd := command.Command(getOpenvpnPath(), args...)
	cmd.Dir = getOpenvpnDir()
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

	output := make(chan string, 100)
	outputWait := sync.WaitGroup{}
	outputWait.Add(1)

	go func() {
		defer func() {
			panc := recover()
			if panc != nil {
				logrus.WithFields(logrus.Fields{
					"stack": string(debug.Stack()),
					"panic": panc,
				}).Error("profile: Panic")
				panic(panc)
			}
		}()

		defer func() {
			stdout.Close()
			output <- ""
		}()

		out := bufio.NewReader(stdout)
		for {
			line, _, err := out.ReadLine()
			if err != nil {
				if err != io.EOF &&
					!strings.Contains(err.Error(), "file already closed") &&
					!strings.Contains(err.Error(), "bad file descriptor") {

					err = &errortypes.ReadError{
						errors.Wrap(err, "profile: Failed to read stdout"),
					}
					logrus.WithFields(logrus.Fields{
						"error": err,
					}).Error("profile: Stdout error")
				}

				return
			}

			lineStr := string(line)
			if lineStr != "" {
				output <- lineStr
			}
		}
	}()

	go func() {
		defer func() {
			panc := recover()
			if panc != nil {
				logrus.WithFields(logrus.Fields{
					"stack": string(debug.Stack()),
					"panic": panc,
				}).Error("profile: Panic")
				panic(panc)
			}
		}()

		defer stderr.Close()

		out := bufio.NewReader(stderr)
		for {
			line, _, err := out.ReadLine()
			if err != nil {
				if err != io.EOF &&
					!strings.Contains(err.Error(), "file already closed") &&
					!strings.Contains(err.Error(), "bad file descriptor") {

					err = &errortypes.ReadError{
						errors.Wrap(err, "profile: Failed to read stderr"),
					}
					logrus.WithFields(logrus.Fields{
						"error": err,
					}).Error("profile: Stderr error")
				}

				return
			}

			lineStr := string(line)
			if lineStr != "" {
				output <- lineStr
			}
		}
	}()

	go func() {
		defer func() {
			panc := recover()
			if panc != nil {
				logrus.WithFields(logrus.Fields{
					"stack": string(debug.Stack()),
					"panic": panc,
				}).Error("profile: Panic")
				panic(panc)
			}
		}()

		defer outputWait.Done()

		for {
			line := <-output
			if line == "" {
				return
			}

			p.parseLine(line)
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
		defer func() {
			panc := recover()
			if panc != nil {
				logrus.WithFields(logrus.Fields{
					"stack": string(debug.Stack()),
					"panic": panc,
				}).Error("profile: Panic")
				panic(panc)
			}
		}()

		cmd.Wait()
		outputWait.Wait()
		running = false

		if runtime.GOOS == "darwin" {
			err = utils.RestoreScutilDns()
			if err != nil {
				logrus.WithFields(logrus.Fields{
					"error": err,
				}).Error("profile: Failed to restore DNS")
			}
		}

		if !p.stop {
			logrus.WithFields(logrus.Fields{
				"profile_id": p.Id,
			}).Error("profile: Unexpected profile exit")
		}

		p.clearStatus(start)
	}()

	if timeout {
		go func() {
			defer func() {
				panc := recover()
				if panc != nil {
					logrus.WithFields(logrus.Fields{
						"stack": string(debug.Stack()),
						"panic": panc,
					}).Error("profile: Panic")
					panic(panc)
				}
			}()

			time.Sleep(connTimeout)
			if p.Status != "connected" && running {
				if runtime.GOOS == "windows" {
					cmd.Process.Kill()
				} else {
					err = p.cmd.Process.Signal(os.Interrupt)
					if err != nil {
						err = &ExecError{
							errors.Wrap(err,
								"profile: Failed to interrupt openvpn"),
						}
						return
					}

					done := false

					go func() {
						defer func() {
							panc := recover()
							if panc != nil {
								logrus.WithFields(logrus.Fields{
									"stack": string(debug.Stack()),
									"panic": panc,
								}).Error("profile: Panic")
								panic(panc)
							}
						}()

						time.Sleep(3 * time.Second)
						if done {
							return
						}
						p.cmd.Process.Kill()
					}()

					p.cmd.Process.Wait()
					done = true
				}

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
	if p.cmd == nil || p.cmd.Process == nil {
		return
	}

	logrus.WithFields(logrus.Fields{
		"profile_id": p.Id,
	}).Info("profile: Disconnecting")

	p.stop = true
	p.Status = "disconnecting"
	p.update()

	if runtime.GOOS == "windows" {
		err = p.cmd.Process.Kill()
		if err != nil {
			err = &ExecError{
				errors.Wrap(err, "profile: Failed to stop openvpn"),
			}
			return
		}
	} else {
		p.cmd.Process.Signal(os.Interrupt)
		done := false

		go func() {
			defer func() {
				panc := recover()
				if panc != nil {
					logrus.WithFields(logrus.Fields{
						"stack": string(debug.Stack()),
						"panic": panc,
					}).Error("profile: Panic")
					panic(panc)
				}
			}()

			time.Sleep(5 * time.Second)
			if done {
				return
			}
			p.cmd.Process.Kill()
		}()

		p.cmd.Process.Wait()
		done = true
	}

	return
}

func (p *Profile) Wait() {
	waiter := make(chan bool, 1)

	p.stateLock.Lock()
	if !p.state {
		return
	}
	p.waiters = append(p.waiters, waiter)
	p.stateLock.Unlock()

	<-waiter
	time.Sleep(50 * time.Millisecond)

	return
}

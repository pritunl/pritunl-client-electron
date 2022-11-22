package parser

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/sirupsen/logrus"
)

type Remote struct {
	Host  string
	Port  int
	Proto string
}

type Ovpn struct {
	EnvId             string
	EnvName           string
	Dev               string
	DevType           string
	Remotes           []Remote
	RemoteRandom      bool
	NoBind            bool
	PersistTun        bool
	Cipher            string
	Auth              string
	Verb              int
	Mute              int
	PushPeerInfo      bool
	Ping              int
	PingExit          int
	HandWindow        int
	ServerPollTimeout int
	RenegSec          int
	RedirectGateway   string
	SndBuf            int
	RcvBuf            int
	RemoteCertTls     string
	Compress          string
	CompLzo           string
	BlockOutsideDns   bool
	AuthUserPass      bool
	KeyDirection      int
	CaCert            string
	TlsAuth           string
	Cert              string
	Key               string

	DisableGateway bool
}

func (o *Ovpn) Export() string {
	output := ""

	if o.EnvId != "" {
		output += fmt.Sprintf("setenv UV_ID %s\n", o.EnvId)
	}
	if o.EnvName != "" {
		output += fmt.Sprintf("setenv UV_NAME %s\n", o.EnvName)
	}
	output += "client\n"
	output += fmt.Sprintf("dev %s\n", o.Dev)
	output += fmt.Sprintf("dev-type %s\n", o.DevType)
	output += "single-session\n"
	for _, remote := range o.Remotes {
		output += fmt.Sprintf(
			"remote %s %d %s\n",
			remote.Host,
			remote.Port,
			remote.Proto,
		)
	}
	if o.RemoteRandom {
		output += "remote-random\n"
	}
	if o.NoBind {
		output += "nobind\n"
	}
	if o.PersistTun {
		output += "persist-tun\n"
	}
	if o.Cipher != "" {
		output += fmt.Sprintf("cipher %s\n", o.Cipher)
	}
	if o.Auth != "" {
		output += fmt.Sprintf("auth %s\n", o.Auth)
	}
	if o.Verb > 0 {
		output += fmt.Sprintf("verb %d\n", o.Verb)
	}
	if o.Mute > 0 {
		output += fmt.Sprintf("mute %d\n", o.Mute)
	}
	if o.PushPeerInfo {
		output += "push-peer-info\n"
	}
	if o.Ping > 0 {
		output += fmt.Sprintf("ping %d\n", o.Ping)
	}
	if o.PingExit > 0 {
		output += fmt.Sprintf("ping-exit %d\n", o.PingExit)
	}
	if o.HandWindow > 0 {
		output += fmt.Sprintf("hand-window %d\n", o.HandWindow)
	}
	if o.ServerPollTimeout > 0 {
		output += fmt.Sprintf("server-poll-timeout %d\n", o.ServerPollTimeout)
	}
	if o.RenegSec > 0 {
		output += fmt.Sprintf("reneg-sec %d\n", o.RenegSec)
	}
	if o.RedirectGateway != "" {
		output += fmt.Sprintf("redirect-gateway %s\n", o.RedirectGateway)
	}
	if o.SndBuf > 0 {
		output += fmt.Sprintf("sndbuf %d\n", o.SndBuf)
	}
	if o.RcvBuf > 0 {
		output += fmt.Sprintf("rcvbuf %d\n", o.RcvBuf)
	}
	if o.RemoteCertTls != "" {
		output += fmt.Sprintf("remote-cert-tls %s\n", o.RemoteCertTls)
	}
	if o.Compress != "" {
		output += fmt.Sprintf("compress %s\n", o.Compress)
	}
	if o.CompLzo != "" {
		output += fmt.Sprintf("comp-lzo %s\n", o.Compress)
	}
	if o.BlockOutsideDns {
		output += "block-outside-dns\n"
	}
	if o.AuthUserPass {
		output += "auth-user-pass\n"
	}
	if o.KeyDirection > 0 {
		output += fmt.Sprintf("key-direction %d\n", o.KeyDirection)
	}

	if o.DisableGateway {
		output += "pull-filter ignore \"redirect-gateway\"\n"
	}

	if o.CaCert != "" {
		output += fmt.Sprintf("<ca>\n%s</ca>\n", o.CaCert)
	}
	if o.TlsAuth != "" {
		output += fmt.Sprintf("<tls-auth>\n%s</tls-auth>\n", o.TlsAuth)
	}
	if o.Cert != "" {
		output += fmt.Sprintf("<cert>\n%s</cert>\n", o.Cert)
	}
	if o.Key != "" {
		output += fmt.Sprintf("<key>\n%s</key>\n", o.Key)
	}

	output += "pull-filter ignore \"ping-restart\"\n"

	return output
}

func Import(data, fixedRemote, fixedRemote6 string, disableGateway bool) (
	o *Ovpn) {

	o = &Ovpn{
		Remotes:        []Remote{},
		DisableGateway: disableGateway,
	}

	inCa := false
	inTls := false
	inCert := false
	inKey := false

	data = strings.ReplaceAll(data, "\r", "")

	fixedPort := 0
	fixedProto := ""

	for _, origLine := range strings.Split(data, "\n") {
		line := FilterStr(origLine, 256)

		if line != origLine {
			logrus.WithFields(logrus.Fields{
				"orig_line": origLine,
				"new_line":  line,
			}).Warn("parser: Configuration line filtered")
		}

		if inCa {
			if line == "</ca>" {
				inCa = false
				continue
			}
			o.CaCert += line + "\n"
		} else if inTls {
			if line == "</tls-auth>" {
				inTls = false
				continue
			}
			o.TlsAuth += line + "\n"
		} else if inCert {
			if line == "</cert>" {
				inCert = false
				continue
			}
			o.Cert += line + "\n"
		} else if inKey {
			if line == "</key>" {
				inKey = false
				continue
			}
			o.Key += line + "\n"
		}

		lines := strings.Split(line, " ")

		key := strings.ToLower(lines[0])

		switch key {
		case "<ca>":
			inCa = true
			break
		case "<tls-auth>":
			inTls = true
			break
		case "<cert>":
			inCert = true
			break
		case "<key>":
			inKey = true
			break
		case "setenv":
			if len(lines) != 3 {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [1]")
				continue
			}
			switch strings.ToLower(lines[1]) {
			case "uv_id":
				o.EnvId = lines[2]
				break
			case "uv_name":
				o.EnvName = lines[2]
				break
			}
			break
		case "dev":
			switch strings.ToLower(lines[1]) {
			case "tun":
				o.Dev = "tun"
				break
			case "tap":
				o.Dev = "tap"
				break
			}
			break
		case "dev-type":
			switch strings.ToLower(lines[1]) {
			case "tun":
				o.Dev = "tun"
				break
			case "tap":
				o.Dev = "tap"
				break
			}
			break
		case "remote":
			if len(lines) != 4 {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line  [2]")
				continue
			}

			port, e := strconv.Atoi(lines[2])
			if e != nil {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [3]")
				continue
			}

			remote := Remote{
				Host: lines[1],
				Port: port,
			}

			switch strings.ToLower(lines[3]) {
			case "udp", "udp-client":
				remote.Proto = "udp"
				break
			case "udp4":
				remote.Proto = "udp4"
				break
			case "udp6", "udp6-client":
				remote.Proto = "udp6"
				break
			case "tcp":
				remote.Proto = "tcp"
				break
			case "tcp4":
				remote.Proto = "tcp4"
				break
			case "tcp6":
				remote.Proto = "tcp6"
				break
			case "tcp-client":
				remote.Proto = "tcp-client"
				break
			case "tcp6-client":
				remote.Proto = "tcp6-client"
				break
			default:
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [4]")
				continue
			}

			if fixedRemote != "" || fixedRemote6 != "" {
				fixedPort = remote.Port
				fixedProto = remote.Proto
			} else {
				o.Remotes = append(o.Remotes, remote)
			}

			break
		case "remote-random":
			o.RemoteRandom = true
			break
		case "nobind":
			o.NoBind = true
			break
		case "persist-tun":
			o.PersistTun = true
			break
		case "cipher":
			if len(lines) != 2 {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [5]")
				continue
			}

			o.Cipher = lines[1]
			break
		case "auth":
			if len(lines) != 2 {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [6]")
				continue
			}

			o.Auth = lines[1]
			break
		case "verb":
			if len(lines) != 2 {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [7]")
				continue
			}

			verb, e := strconv.Atoi(lines[1])
			if e != nil {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [8]")
				continue
			}

			o.Verb = verb
			break
		case "mute":
			if len(lines) != 2 {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [9]")
				continue
			}

			mute, e := strconv.Atoi(lines[1])
			if e != nil {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [10]")
				continue
			}

			o.Mute = mute
			break
		case "push-peer-info":
			o.PushPeerInfo = true
			break
		case "ping":
			if len(lines) != 2 {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [11]")
				continue
			}

			ping, e := strconv.Atoi(lines[1])
			if e != nil {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [12]")
				continue
			}

			o.Ping = ping
			break
		case "ping-restart":
			if len(lines) != 2 {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [13]")
				continue
			}

			pingRestart, e := strconv.Atoi(lines[1])
			if e != nil {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [14]")
				continue
			}

			o.PingExit = pingRestart
			break
		case "ping-exit":
			if len(lines) != 2 {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [15]")
				continue
			}

			pingExit, e := strconv.Atoi(lines[1])
			if e != nil {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [16]")
				continue
			}

			o.PingExit = pingExit
			break
		case "hand-window":
			if len(lines) != 2 {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [17]")
				continue
			}

			handWindow, e := strconv.Atoi(lines[1])
			if e != nil {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [18]")
				continue
			}

			o.HandWindow = handWindow
			break
		case "server-poll-timeout":
			if len(lines) != 2 {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [19]")
				continue
			}

			serverPollTimeout, e := strconv.Atoi(lines[1])
			if e != nil {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [20]")
				continue
			}

			o.ServerPollTimeout = serverPollTimeout
			break
		case "reneg-sec":
			if len(lines) != 2 {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [21]")
				continue
			}

			renegSec, e := strconv.Atoi(lines[1])
			if e != nil {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [22]")
				continue
			}

			o.RenegSec = renegSec
			break
		case "redirect-gateway":
			if len(lines) != 2 {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [35]")
				continue
			}

			switch strings.ToLower(lines[1]) {
			case "local":
				o.RedirectGateway = "local"
				break
			case "autolocal":
				o.RedirectGateway = "autolocal"
				break
			case "def1":
				o.RedirectGateway = "def1"
				break
			case "bypass-dhcp":
				o.RedirectGateway = "bypass-dhcp"
				break
			case "bypass-dns":
				o.RedirectGateway = "bypass-dns"
				break
			case "block-local":
				o.RedirectGateway = "block-local"
				break
			case "ipv6":
				o.RedirectGateway = "ipv6"
				break
			case "!ipv4":
				o.RedirectGateway = "!ipv4"
				break
			default:
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [36]")
				continue
			}

			break
		case "sndbuf":
			if len(lines) != 2 {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [23]")
				continue
			}

			sndbuf, e := strconv.Atoi(lines[1])
			if e != nil {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [24]")
				continue
			}

			o.SndBuf = sndbuf
			break
		case "rcvbuf":
			if len(lines) != 2 {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [25]")
				continue
			}

			rcvbuf, e := strconv.Atoi(lines[1])
			if e != nil {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [26]")
				continue
			}

			o.RcvBuf = rcvbuf
			break
		case "remote-cert-tls":
			if len(lines) != 2 {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [27]")
				continue
			}

			switch strings.ToLower(lines[1]) {
			case "server":
				o.RemoteCertTls = "server"
				break
			default:
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [28]")
				continue
			}

			break
		case "comp-lzo":
			if len(lines) != 2 {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [29]")
				continue
			}

			switch strings.ToLower(lines[1]) {
			case "yes":
				o.CompLzo = "yes"
				break
			case "no":
				o.CompLzo = "no"
				break
			default:
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [30]")
				continue
			}

			break
		case "block-outside-dns":
			o.BlockOutsideDns = true
			break
		case "compress":
			if len(lines) != 2 {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [31]")
				continue
			}

			switch strings.ToLower(lines[1]) {
			case "lzo":
				o.Compress = "lzo"
				break
			case "lz4":
				o.Compress = "lz4"
				break
			default:
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [32]")
				continue
			}

			break
		case "auth-user-pass":
			o.AuthUserPass = true
			break
		case "key-direction":
			if len(lines) != 2 {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [33]")
				continue
			}

			keyDirection, e := strconv.Atoi(lines[1])
			if e != nil {
				logrus.WithFields(logrus.Fields{
					"line": line,
				}).Warn("parser: Configuration line ignored [34]")
				continue
			}

			o.KeyDirection = keyDirection
			break
		}
	}

	if o.Dev == "" {
		o.Dev = "tun"
	}
	if o.DevType == "" {
		o.DevType = "tun"
	}

	if fixedRemote != "" {
		o.Remotes = append(o.Remotes, Remote{
			Host:  fixedRemote,
			Port:  fixedPort,
			Proto: fixedProto,
		})
	}
	if fixedRemote6 != "" {
		o.Remotes = append(o.Remotes, Remote{
			Host:  fixedRemote6,
			Port:  fixedPort,
			Proto: fixedProto,
		})
	}

	return
}

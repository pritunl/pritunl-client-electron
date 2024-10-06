package connection

import (
	mathrand "math/rand"
	"net"
	"net/url"
	"strconv"
	"strings"

	"github.com/dropbox/godropbox/container/set"
	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/errortypes"
	"github.com/pritunl/pritunl-client-electron/service/event"
	"github.com/pritunl/pritunl-client-electron/service/geosort"
	"github.com/pritunl/pritunl-client-electron/service/token"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"github.com/sirupsen/logrus"
)

const (
	Connecting = "connecting"
	Connected  = "connected"

	OvpnRemote = "ovpn"
	SyncRemote = "sync"
)

type Data struct {
	conn            *Connection `json:"-"`
	Id              string      `json:"id"`
	Mode            string      `json:"mode"`
	WgIface         string      `json:"iface"`
	OvpnIface       string      `json:"tun_iface"`
	Routes          []*Route    `json:"routes"`
	Routes6         []*Route    `json:"routes6"`
	Status          string      `json:"status"`
	Timestamp       int64       `json:"timestamp"`
	GatewayAddr     string      `json:"gateway_addr"`
	GatewayAddr6    string      `json:"gateway_addr6"`
	ServerAddr      string      `json:"server_addr"`
	ClientAddr      string      `json:"client_addr"`
	MacAddr         string      `json:"mac_addr"`
	WebPort         int         `json:"web_port"`
	WebNoSsl        bool        `json:"web_no_ssl"`
	RegistrationKey string      `json:"registration_key"`
	SsoUrl          string      `json:"sso_url"`
	DeviceId        string      `json:"-"`
	DeviceName      string      `json:"-"`
	PrivateKey      string      `json:"-"`
	Hostname        string      `json:"hostname"`
	PublicAddr      string      `json:"public_addr"`
	PublicAddr6     string      `json:"public_addr6"`
	Remotes         []*Remote   `json:"remotes"`
	macAddrs        []string    `json:"-"`
	authToken       *AuthToken  `json:"-"`
}

type Route struct {
	NextHop    string `json:"next_hop"`
	Network    string `json:"network"`
	Metric     int    `json:"metric"`
	NetGateway bool   `json:"net_gateway"`
}

func (d *Data) Fields() logrus.Fields {
	return logrus.Fields{
		"data_mode":       d.Mode,
		"data_wg_iface":   d.WgIface,
		"data_ovpn_iface": d.OvpnIface,
		"data_status":     d.Status,
		"data_timestamp":  d.Timestamp,
	}
}

func (d *Data) UpdateEvent() {
	evt := event.Event{
		Type: "update",
		Data: d,
	}
	evt.Init()

	if GlobalStore.IsConnected() {
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

func (d *Data) GetMacAddrs() (addrs []string, err error) {
	if d.macAddrs != nil {
		addrs = d.macAddrs
		return
	}

	ifaces, err := net.Interfaces()
	if err != nil {
		err = &errortypes.ReadError{
			errors.New("data: Failed to load interfaces"),
		}
		return
	}

	macAddrs := []string{}
	for _, iface := range ifaces {
		if iface.Flags&net.FlagUp == 0 ||
			iface.Flags&net.FlagLoopback != 0 ||
			iface.HardwareAddr == nil ||
			iface.HardwareAddr.String() == "" {

			continue
		}

		macAddr := iface.HardwareAddr.String()
		if d.MacAddr == "" {
			d.MacAddr = macAddr
		}

		macAddrs = append(macAddrs, macAddr)
	}

	d.macAddrs = macAddrs

	addrs = macAddrs
	return
}

func (d *Data) ParseProfile() (err error) {
	remotes := Remotes{}
	remoteHosts := set.NewSet()

	defaultOvpnPort := 0
	defaultOvpnProto := ""

	rangeKey := false
	for _, line := range strings.Split(d.conn.Profile.Data, "\n") {
		if !rangeKey {
			if strings.HasPrefix(line, "setenv UV_ID") {
				lineSpl := strings.Split(line, " ")
				if len(lineSpl) < 3 {
					continue
				}

				d.DeviceId = lineSpl[2]
			} else if strings.HasPrefix(line, "setenv UV_NAME") {
				lineSpl := strings.Split(line, " ")
				if len(lineSpl) < 3 {
					continue
				}

				d.DeviceName = lineSpl[2]
			} else if strings.HasPrefix(line, "remote ") {
				lineSpl := strings.Split(line, " ")
				if len(lineSpl) < 4 {
					logrus.WithFields(d.conn.Fields(logrus.Fields{
						"remote": line,
					})).Error("data: Profile contains invalid remote")
					continue
				}

				ovpnPort, e := strconv.Atoi(lineSpl[2])
				if e != nil {
					logrus.WithFields(d.conn.Fields(logrus.Fields{
						"remote": line,
					})).Error("data: Profile contains invalid remote port")
					continue
				}
				ovpnProto := lineSpl[3]

				if defaultOvpnPort == 0 {
					defaultOvpnPort = ovpnPort
					defaultOvpnProto = ovpnProto
				}

				remote := &Remote{
					Host:      lineSpl[1],
					OvpnPort:  ovpnPort,
					OvpnProto: ovpnProto,
					Type:      OvpnRemote,
				}
				if !remoteHosts.Contains(remote.Host) {
					remoteHosts.Add(remote.Host)
					remotes = append(remotes, remote)
				}
			} else if strings.HasPrefix(line, "<key>") {
				rangeKey = true
			}
		} else {
			if strings.HasPrefix(line, "</key>") {
				rangeKey = false
			} else {
				d.PrivateKey += line + "\n"
			}
		}
	}

	for _, syncAddr := range d.conn.Profile.SyncHosts {
		syncUrl, e := url.Parse(syncAddr)
		if e != nil {
			e = &errortypes.ParseError{
				errors.Wrap(e, "data: Sync address parse error"),
			}

			logrus.WithFields(d.conn.Fields(logrus.Fields{
				"sync_addr": syncAddr,
				"error":     e,
			})).Error("data: Profile contains invalid sync address")
			continue
		}

		remote := &Remote{
			Host:      syncUrl.Host,
			OvpnPort:  defaultOvpnPort,
			OvpnProto: defaultOvpnProto,
			Type:      SyncRemote,
		}
		if !remoteHosts.Contains(remote.Host) {
			remoteHosts.Add(remote.Host)
			remotes = append(remotes, remote)
		}
	}

	d.Hostname, err = utils.GetHostname()
	if err != nil {
		return
	}

	if d.conn.Profile.DynamicFirewall || d.conn.Profile.IsGeoSort() {
		addr4, e := utils.GetPublicAddress4()
		if e != nil {
			logrus.WithFields(d.conn.Fields(logrus.Fields{
				"error": e,
			})).Error("data: Failed to get public IPv4 address")
		}
		d.PublicAddr = addr4

		addr6, e := utils.GetPublicAddress6()
		if e != nil {
			logrus.Info("geosort: Failed to get public IPv6 address")
		}
		d.PublicAddr6 = addr6
	}

	sortMethod := ""
	if d.conn.Profile.IsGeoSort() {
		sortMethod = "geo"
		remoteHosts := geosort.SortRemotes(
			d.PublicAddr, d.PublicAddr6, remotes.GetHosts(),
			d.conn.Profile.GeoSort)

		addrMap, otherRemotes := remotes.GetAddrMap()
		newRemotes := Remotes{}
		for _, remoteHost := range remoteHosts {
			remote := addrMap[remoteHost]
			if remote == nil {
				logrus.WithFields(d.conn.Fields(logrus.Fields{
					"host": remoteHost,
				})).Error("connection: Found unknown host from geosort")
				continue
			}

			newRemotes = append(newRemotes, remote)
		}

		for _, remote := range otherRemotes {
			newRemotes = append(newRemotes, remote)
		}

		remotes = newRemotes
	} else {
		sortMethod = "random"
		newRemotes := Remotes{}

		for _, i := range mathrand.Perm(len(remotes)) {
			newRemotes = append(newRemotes, remotes[i])
		}

		remotes = newRemotes
	}

	logrus.WithFields(logrus.Fields{
		"public_address":  d.PublicAddr,
		"public_address6": d.PublicAddr6,
		"sort_method":     sortMethod,
		"remotes":         remotes.GetFormatted(),
	}).Info("connection: Resolved remotes")

	d.Remotes = remotes

	return
}

type AuthToken struct {
	Token      string
	Nonce      string
	Validated  bool
	Expiration bool
	tokn       *token.Token
}

func (t *AuthToken) Reset() {
	if t.tokn != nil {
		t.tokn.Reset()
	}
}

func (d *Data) ResetAuthToken() {
	authToken := d.authToken
	if authToken != nil {
		authToken.Reset()
	}
}

func (d *Data) GetAuthToken() (authToken *AuthToken, err error) {
	if d.authToken != nil {
		authToken = d.authToken
		return
	}

	tokn := token.Get(
		d.conn.Id,
		d.conn.Profile.ServerPublicKey,
		d.conn.Profile.ServerBoxPublicKey,
	)

	token := ""
	validated := false
	expired := false
	if tokn != nil {
		expired, err = tokn.Update()
		if err != nil {
			return
		}

		if expired {
			logrus.WithFields(d.conn.Fields(logrus.Fields{
				"token_timestamp": tokn.Timestamp,
				"token_ttl":       tokn.Ttl,
			})).Info("connection: Token expired, disconnecting")

			d.conn.State.Close()
			return
		} else {
			token = tokn.Token
			validated = tokn.Valid
		}
	}

	if token == "" {
		token, err = utils.RandStrComplex(16)
		if err != nil {
			return
		}
		validated = false
	}

	nonce, err := utils.RandStr(16)
	if err != nil {
		return
	}

	authToken = &AuthToken{
		Token:      token,
		Nonce:      nonce,
		Validated:  validated,
		Expiration: expired,
		tokn:       tokn,
	}
	d.authToken = authToken

	return
}

func (d *Data) SendProfileEvent(evtType string) {
	evt := &event.Event{
		Type: evtType,
		Data: d,
	}
	evt.Init()
}

package profile

import (
	"text/template"
)

const (
	WgWinPath     = "C:\\Program Files\\WireGuard\\wireguard.exe"
	WgMacConfPath = "/usr/local/etc/wireguard"
	Ovpn          = "ovpn"
	Wg            = "wg"
	wgConfTempl   = `[Interface]
Address = {{.Address}}
PrivateKey = {{.PrivateKey}}{{if .HasDns}}
DNS = {{.DnsServers}}{{end}}

[Peer]
PublicKey = {{.PublicKey}}
AllowedIPs = {{.AllowedIps}}
Endpoint = {{.Endpoint}}
`
)

var WgConfTempl = template.Must(template.New("wg_conf").Parse(wgConfTempl))

type WgConfData struct {
	Address    string
	PrivateKey string
	HasDns     bool
	DnsServers string
	PublicKey  string
	AllowedIps string
	Endpoint   string
}

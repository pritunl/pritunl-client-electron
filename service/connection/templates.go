package connection

import (
	"regexp"
	"text/template"
)

const (
	wgConfTempl = `[Interface]
Address = {{.Address}}
PrivateKey = {{.PrivateKey}}{{if .HasMtu}}
MTU = {{.Mtu}}{{end}}{{if .HasDns}}
DNS = {{.DnsServers}}{{end}}

[Peer]
PublicKey = {{.PublicKey}}
AllowedIPs = {{.AllowedIps}}
Endpoint = {{.Endpoint}}
`
)

var (
	wgIfaceMacReg = regexp.MustCompile("\\((utun[0-9]+)\\)")
	WgConfTempl   = template.Must(template.New("wg_conf").Parse(wgConfTempl))
)

type WgConfData struct {
	Address    string
	PrivateKey string
	HasMtu     bool
	Mtu        int
	HasDns     bool
	DnsServers string
	PublicKey  string
	AllowedIps string
	Endpoint   string
}

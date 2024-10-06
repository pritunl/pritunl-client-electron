package connection

import (
	"fmt"
	"net"
	"net/url"
	"strings"

	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/errortypes"
	"github.com/sirupsen/logrus"
)

type Remote struct {
	Host      string
	Addr4     string
	Addr6     string
	OvpnPort  int
	OvpnProto string
	Type      string
}

type Remotes []*Remote

func (r Remotes) GetHosts() (hosts []string) {
	hosts = []string{}

	for _, remote := range r {
		hosts = append(hosts, remote.Host)
	}

	return
}

func (r Remotes) GetFormatted() (hosts []string) {
	hosts = []string{}

	for _, remote := range r {
		hosts = append(hosts, remote.GetFormatted())
	}

	return
}

func (r Remotes) GetAddrMap() (addrMap map[string]*Remote, other []*Remote) {
	addrMap = map[string]*Remote{}
	other = []*Remote{}

	for _, remote := range r {
		if remote.Addr4 != "" {
			addrMap[remote.Addr4] = remote
		}
		if remote.Addr6 != "" {
			addrMap[remote.Addr6] = remote
		}

		if remote.Addr4 == "" && remote.Addr6 == "" {
			other = append(other, remote)
		}
	}

	return
}

func (r *Remote) Lookup() {
	ip := net.ParseIP(r.Host)
	if ip != nil {
		ipStr := ip.String()
		if ip.To4() == nil {
			r.Addr6 = ipStr
		} else {
			r.Addr4 = ipStr
		}
	} else {
		remoteIps, err := net.LookupIP(r.Host)
		if err != nil {
			err = &errortypes.RequestError{
				errors.Wrap(err, "remotes: Failed to resolve remote"),
			}

			logrus.WithFields(logrus.Fields{
				"host":  r.Host,
				"error": err,
			}).Info("profile: Failed to resolve remote")
			return
		}

		for _, remoteIp := range remoteIps {
			remoteIpStr := remoteIp.String()
			if remoteIp.To4() == nil {
				if r.Addr6 == "" {
					r.Addr6 = remoteIpStr
				} else {
					// TODO Handle multiple
				}
			} else {
				if r.Addr4 == "" {
					r.Addr4 = remoteIpStr
				} else {
					// TODO Handle multiple
				}
			}
		}
	}
}

func (r *Remote) GetUrl(path string) *url.URL {
	remote := r.Host

	if strings.Count(remote, ":") > 1 && !strings.Contains(remote, "[") {
		remote = "[" + remote + "]"
	}

	return &url.URL{
		Scheme: "https",
		Host:   remote,
		Path:   path,
	}
}

func (r *Remote) GetFormatted() (host string) {
	host = r.Host
	if r.Addr4 != "" {
		host += fmt.Sprint("[%s]", r.Addr4)
	}
	if r.Addr6 != "" {
		host += fmt.Sprint("[%s]", r.Addr6)
	}

	return
}

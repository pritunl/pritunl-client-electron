package sprofile

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"runtime"
	"strings"

	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/cli/errortypes"
	"github.com/pritunl/pritunl-client-electron/cli/profile"
	"github.com/pritunl/pritunl-client-electron/cli/service"
)

type Sprofile struct {
	Id                 string                `json:"id"`
	Name               string                `json:"name"`
	State              bool                  `json:"state"`
	Wg                 bool                  `json:"wg"`
	LastMode           string                `json:"last_mode"`
	OrganizationId     string                `json:"organization_id"`
	Organization       string                `json:"organization"`
	ServerId           string                `json:"server_id"`
	Server             string                `json:"server"`
	UserId             string                `json:"user_id"`
	User               string                `json:"user"`
	PreConnectMsg      string                `json:"pre_connect_msg"`
	RemotesData        map[string]RemoteData `json:"remotes_data"`
	DynamicFirewall    bool                  `json:"dynamic_firewall"`
	GeoSort            string                `json:"geo_sort"`
	ForceConnect       bool                  `json:"force_connect"`
	DeviceAuth         bool                  `json:"device_auth"`
	DisableGateway     bool                  `json:"disable_gateway"`
	DisableDns         bool                  `json:"disable_dns"`
	RestrictClient     bool                  `json:"restrict_client"`
	ForceDns           bool                  `json:"force_dns"`
	SsoAuth            bool                  `json:"sso_auth"`
	PasswordMode       string                `json:"password_mode"`
	Token              bool                  `json:"token"`
	TokenTtl           int                   `json:"token_ttl"`
	Disabled           bool                  `json:"disabled"`
	SyncHosts          []string              `json:"sync_hosts"`
	SyncHash           string                `json:"sync_hash"`
	SyncSecret         string                `json:"sync_secret"`
	SyncToken          string                `json:"sync_token"`
	ServerPublicKey    []string              `json:"server_public_key"`
	ServerBoxPublicKey string                `json:"server_box_public_key"`
	RegistrationKey    string                `json:"registration_key"`
	OvpnData           string                `json:"ovpn_data"`
	Password           string                `json:"password"`
	Profile            *profile.Profile      `json:"-"`
}

type RemoteData struct {
	Priority int `json:"priority"`
}

func (s *Sprofile) FormatedName() (name string) {
	name = s.Name

	if name == "" {
		if s.User != "" {
			name = strings.SplitN(s.User, "@", 2)[0]

			if s.Server != "" {
				name += fmt.Sprintf(" (%s)", s.Server)
			}
		} else if s.Server != "" {
			name = s.Server
		} else {
			name = "Unknown Profile"
		}
	}

	return
}

func (s *Sprofile) FormatedRunState() string {
	if s.State {
		return "Active"
	} else {
		return "Inactive"
	}
}

func (s *Sprofile) FormatedState() string {
	if s.Disabled {
		return "Disabled"
	} else {
		return "Enabled"
	}
}

func (s *Sprofile) GetLogs() (data string, err error) {
	reqUrl := service.GetAddress() + "/sprofile/" + s.Id + "/log"

	authKey, err := service.GetAuthKey()
	if err != nil {
		return
	}

	req, err := http.NewRequest("GET", reqUrl, nil)
	if err != nil {
		err = errortypes.RequestError{
			errors.Wrap(err, "sprofile: Get request failed"),
		}
		return
	}

	if runtime.GOOS == "linux" || runtime.GOOS == "darwin" {
		req.Host = "unix"
	}
	req.Header.Set("Auth-Key", authKey)
	req.Header.Set("User-Agent", "pritunl")

	resp, err := service.GetClient().Do(req)
	if err != nil {
		err = errortypes.RequestError{
			errors.Wrap(err, "sprofile: Request failed"),
		}
		return
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		err = errortypes.ReadError{
			errors.Wrap(err, "sprofile: Failed to read response"),
		}
		return
	}

	data = strings.TrimSpace(string(body)) + "\n"

	return
}

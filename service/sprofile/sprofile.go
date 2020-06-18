package sprofile

import (
	"encoding/json"
	"path"

	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/errortypes"
	"github.com/pritunl/pritunl-client-electron/service/utils"
)

type Sprofile struct {
	Id                 string   `json:"id"`
	Name               string   `json:"name"`
	Wg                 bool     `json:"wg"`
	OrganizationId     string   `json:"organization_id"`
	Organization       string   `json:"organization"`
	ServerId           string   `json:"server_id"`
	Server             string   `json:"server"`
	UserId             string   `json:"user_id"`
	User               string   `json:"user"`
	PreConnectMsg      string   `json:"pre_connect_msg"`
	PasswordMode       string   `json:"password_mode"`
	Token              bool     `json:"token"`
	TokenTtl           int      `json:"token_ttl"`
	DisableReconnect   bool     `json:"disable_reconnect"`
	SyncHosts          []string `json:"sync_hosts"`
	SyncHash           string   `json:"sync_hash"`
	SyncSecret         string   `json:"sync_secret"`
	SyncToken          string   `json:"sync_token"`
	ServerPublicKey    []string `json:"server_public_key"`
	ServerBoxPublicKey string   `json:"server_box_public_key"`
	OvpnData           string   `json:"ovpn_data"`
	Path               string   `json:"-"`
	LogPath            string   `json:"-"`
}

func (s *Sprofile) Commit() (err error) {
	prflsPath := GetPath()

	err = utils.ExistsMkdir(prflsPath, 0700)
	if err != nil {
		return
	}

	pth := path.Join(prflsPath, s.Id+".conf")

	data, err := json.Marshal(s)
	if err != nil {
		err = &errortypes.ParseError{
			errors.Wrap(err, "sprofiles: Failed to parse profile data"),
		}
		return
	}

	err = utils.CreateWrite(pth, string(data), 0600)
	if err != nil {
		return
	}

	return
}

func (s *Sprofile) Delete() (err error) {
	prflsPath := GetPath()
	pth := path.Join(prflsPath, s.Id+".conf")

	_ = utils.Remove(pth)

	return
}

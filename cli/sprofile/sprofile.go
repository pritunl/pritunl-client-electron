package sprofile

type Sprofile struct {
	Id                 string   `json:"id"`
	Name               string   `json:"name"`
	Wg                 bool     `json:"wg"`
	LastMode           string   `json:"last_mode"`
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
	Password           string   `json:"password"`
}

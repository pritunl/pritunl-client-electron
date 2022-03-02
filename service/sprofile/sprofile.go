package sprofile

import (
	"crypto/hmac"
	"crypto/sha512"
	"crypto/subtle"
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/errortypes"
	"github.com/pritunl/pritunl-client-electron/service/platform"
	"github.com/pritunl/pritunl-client-electron/service/utils"
)

var (
	clientInsecure = &http.Client{
		Transport: &http.Transport{
			TLSHandshakeTimeout: 10 * time.Second,
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true,
				MinVersion:         tls.VersionTLS12,
				MaxVersion:         tls.VersionTLS13,
			},
		},
		Timeout: 10 * time.Second,
	}
)

type SyncData struct {
	Signature string `json:"signature"`
	Conf      string `json:"conf"`
}

type Sprofile struct {
	Id                 string   `json:"id"`
	Name               string   `json:"name"`
	State              bool     `json:"-"`
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
	Path               string   `json:"-"`
	Password           string   `json:"password"`
	AuthErrorCount     int      `json:"-"`
}

type SprofileClient struct {
	Id                 string   `json:"id"`
	Name               string   `json:"name"`
	State              bool     `json:"state"`
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
}

func (s *Sprofile) BasePath() string {
	prflsPath := GetPath()
	return path.Join(prflsPath, s.Id)
}

func (s *Sprofile) Client() (sprflc *SprofileClient) {
	sprflc = &SprofileClient{
		Id:                 s.Id,
		Name:               s.Name,
		State:              s.State,
		Wg:                 s.Wg,
		LastMode:           s.LastMode,
		OrganizationId:     s.OrganizationId,
		Organization:       s.Organization,
		ServerId:           s.ServerId,
		Server:             s.Server,
		UserId:             s.UserId,
		User:               s.User,
		PreConnectMsg:      s.PreConnectMsg,
		PasswordMode:       s.PasswordMode,
		Token:              s.Token,
		TokenTtl:           s.TokenTtl,
		DisableReconnect:   s.DisableReconnect,
		SyncHosts:          s.SyncHosts,
		SyncHash:           s.SyncHash,
		SyncSecret:         s.SyncSecret,
		SyncToken:          s.SyncToken,
		ServerPublicKey:    s.ServerPublicKey,
		ServerBoxPublicKey: s.ServerBoxPublicKey,
		OvpnData:           s.OvpnData,
	}

	return
}

func (s *Sprofile) Copy() (sprfl *Sprofile) {
	var syncHosts []string
	if s.SyncHosts != nil {
		syncHosts = []string{}
		for _, host := range s.SyncHosts {
			syncHosts = append(syncHosts, host)
		}
	}

	var serverPublicKey []string
	if s.ServerPublicKey != nil {
		serverPublicKey = []string{}
		for _, key := range s.ServerPublicKey {
			serverPublicKey = append(serverPublicKey, key)
		}
	}

	sprfl = &Sprofile{
		Id:                 s.Id,
		Name:               s.Name,
		State:              s.State,
		Wg:                 s.Wg,
		LastMode:           s.LastMode,
		OrganizationId:     s.OrganizationId,
		Organization:       s.Organization,
		ServerId:           s.ServerId,
		Server:             s.Server,
		UserId:             s.UserId,
		User:               s.User,
		PreConnectMsg:      s.PreConnectMsg,
		PasswordMode:       s.PasswordMode,
		Token:              s.Token,
		TokenTtl:           s.TokenTtl,
		DisableReconnect:   s.DisableReconnect,
		SyncHosts:          syncHosts,
		SyncHash:           s.SyncHash,
		SyncSecret:         s.SyncSecret,
		SyncToken:          s.SyncToken,
		ServerPublicKey:    serverPublicKey,
		ServerBoxPublicKey: s.ServerBoxPublicKey,
		OvpnData:           s.OvpnData,
		Path:               s.Path,
		Password:           s.Password,
		AuthErrorCount:     s.AuthErrorCount,
	}

	return
}

func (s *Sprofile) GetOutput() (data string, err error) {
	logPth := s.BasePath() + ".log"

	exists, err := utils.Exists(logPth)
	if err != nil {
		err = &errortypes.ReadError{
			errors.Wrap(err, "sprofile: Failed to check log file"),
		}
		return
	}

	if exists {
		dataByt, e := ioutil.ReadFile(logPth)
		if e != nil {
			err = &errortypes.ReadError{
				errors.Wrap(e, "sprofile: Failed to read log file"),
			}
			return
		}

		data = string(dataByt)
	}

	return
}

func (s *Sprofile) PushOutput(line string) (err error) {
	logPth1 := s.BasePath() + ".log"
	logPth2 := s.BasePath() + ".log.1"

	file, err := os.OpenFile(logPth1,
		os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0644)
	if err != nil {
		err = &errortypes.WriteError{
			errors.Wrap(err, "sprofile: Failed to open log file"),
		}
		return
	}
	defer file.Close()

	stat, err := file.Stat()
	if err != nil {
		err = &errortypes.ReadError{
			errors.Wrap(err, "sprofile: Failed to stat log file"),
		}
		return
	}

	if stat.Size() >= 1000000 {
		os.Remove(logPth2)
		err = os.Rename(logPth1, logPth2)
		if err != nil {
			err = &errortypes.WriteError{
				errors.Wrap(err, "sprofile: Failed to rotate log file"),
			}
			return
		}

		file.Close()
		file, err = os.OpenFile(logPth1,
			os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0644)
		if err != nil {
			err = &errortypes.WriteError{
				errors.Wrap(err, "sprofile: Failed to open log file"),
			}
			return
		}
	}

	_, err = file.Write([]byte(line))
	if err != nil {
		err = &errortypes.WriteError{
			errors.Wrap(err, "sprofile: Failed to write to log file"),
		}
		return
	}

	return
}

func (s *Sprofile) syncUpdate(data string) (updated bool, err error) {
	sIndex := 0
	eIndex := 0
	tlsAuth := ""
	cert := ""
	key := ""
	jsonData := ""
	jsonFound := false
	jsonLoaded := false

	dataLines := strings.Split(s.OvpnData, "\n")
	uvId := ""
	uvName := ""
	for _, line := range dataLines {
		if strings.HasPrefix(line, "setenv UV_ID ") {
			uvId = line
		} else if strings.HasPrefix(line, "setenv UV_NAME ") {
			uvName = line
		}
	}

	dataLines = strings.Split(data, "\n")
	data = ""
	for _, line := range dataLines {
		if !jsonLoaded && !jsonFound && line == "#{" {
			jsonFound = true
			jsonLoaded = true
		}

		if jsonFound && strings.HasPrefix(line, "#") {
			if line == "#}" {
				jsonFound = false
			}
			jsonData += strings.Replace(line, "#", "", 1)
		} else {
			if strings.HasPrefix(line, "setenv UV_ID ") {
				line = uvId
			} else if strings.HasPrefix(line, "setenv UV_NAME ") {
				line = uvName
			}

			data += line + "\n"
		}
	}

	if jsonLoaded {
		confData := &Sprofile{}
		err = json.Unmarshal([]byte(jsonData), confData)
		if err != nil {
			err = &errortypes.ParseError{
				errors.Wrap(err, "profile: Failed to parse sync conf data"),
			}
			return
		}

		s.Name = confData.Name
		s.Wg = confData.Wg
		s.OrganizationId = confData.OrganizationId
		s.Organization = confData.Organization
		s.ServerId = confData.ServerId
		s.Server = confData.Server
		s.UserId = confData.UserId
		s.User = confData.User
		s.PreConnectMsg = confData.PreConnectMsg
		s.PasswordMode = confData.PasswordMode
		s.Token = confData.Token
		s.TokenTtl = confData.TokenTtl
		s.DisableReconnect = confData.DisableReconnect
		s.SyncHosts = confData.SyncHosts
		s.SyncHash = confData.SyncHash
		s.ServerPublicKey = confData.ServerPublicKey
		s.ServerBoxPublicKey = confData.ServerBoxPublicKey
	}

	if strings.Contains(s.OvpnData, "key-direction") &&
		!strings.Contains(data, "key-direction") {

		tlsAuth += "key-direction 1\n"
	}

	sIndex = strings.Index(s.OvpnData, "<tls-auth>")
	eIndex = strings.Index(s.OvpnData, "</tls-auth>")
	if sIndex >= 0 && eIndex >= 0 {
		tlsAuth += s.OvpnData[sIndex:eIndex+11] + "\n"
	}

	sIndex = strings.Index(s.OvpnData, "<cert>")
	eIndex = strings.Index(s.OvpnData, "</cert>")
	if sIndex >= 0 && eIndex >= 0 {
		cert += s.OvpnData[sIndex:eIndex+7] + "\n"
	}

	sIndex = strings.Index(s.OvpnData, "<key>")
	eIndex = strings.Index(s.OvpnData, "</key>")
	if sIndex >= 0 && eIndex >= 0 {
		key += s.OvpnData[sIndex:eIndex+6] + "\n"
	}

	s.OvpnData = data + tlsAuth + cert + key
	err = s.Commit()
	if err != nil {
		return
	}

	updated = true

	return
}

func (s *Sprofile) syncProfile(host string) (updated bool, err error) {
	pth := fmt.Sprintf(
		"/key/sync/%s/%s/%s/%s",
		s.OrganizationId,
		s.UserId,
		s.ServerId,
		s.SyncHash,
	)

	u := host + pth

	if !strings.HasPrefix(u, "https") {
		err = &errortypes.RequestError{
			errors.Wrap(err, "profile: Sync profile invalid URL"),
		}
		return
	}

	timestamp := strconv.FormatInt(time.Now().Unix(), 10)

	authNonce, err := utils.RandStr(32)
	if err != nil {
		return
	}

	authStr := strings.Join([]string{
		s.SyncToken,
		timestamp,
		authNonce,
		"GET",
		pth,
	}, "&")

	hashFunc := hmac.New(sha512.New, []byte(s.SyncSecret))
	hashFunc.Write([]byte(authStr))
	rawSignature := hashFunc.Sum(nil)
	sig := base64.StdEncoding.EncodeToString(rawSignature)

	req, err := http.NewRequest(
		"GET",
		u,
		nil,
	)
	if err != nil {
		err = &errortypes.RequestError{
			errors.Wrap(err, "profile: Sync profile request error"),
		}
		return
	}

	req.Header.Set("Auth-Token", s.SyncToken)
	req.Header.Set("Auth-Timestamp", timestamp)
	req.Header.Set("Auth-Nonce", authNonce)
	req.Header.Set("Auth-Signature", sig)
	req.Header.Set("User-Agent", "pritunl")

	res, err := clientInsecure.Do(req)
	if err != nil {
		err = &errortypes.RequestError{
			errors.Wrap(err, "sprofile: Sync profile connection error"),
		}
		return
	}
	defer res.Body.Close()

	if res.StatusCode == 480 {
		return
	}

	if res.StatusCode != 200 {
		err = &errortypes.RequestError{
			errors.Wrapf(err, "profile: Bad status %n code from server",
				res.StatusCode),
		}
		return
	}

	syncData := &SyncData{}
	err = json.NewDecoder(res.Body).Decode(&syncData)
	if err != nil {
		err = &errortypes.ParseError{
			errors.Wrap(err, "profile: Failed to parse response body"),
		}
		return
	}

	if syncData.Conf == "" {
		return
	}

	hashFuncSync := hmac.New(sha512.New, []byte(s.SyncSecret))
	hashFuncSync.Write([]byte(syncData.Conf))
	rawSignatureSync := hashFuncSync.Sum(nil)
	sigSync := base64.StdEncoding.EncodeToString(rawSignatureSync)

	if subtle.ConstantTimeCompare(
		[]byte(sigSync), []byte(syncData.Signature)) != 1 {

		err = &errortypes.ParseError{
			errors.New("profile: Sync profile signature invalid"),
		}
		return
	}

	updated, err = s.syncUpdate(syncData.Conf)
	if err != nil {
		return
	}

	return
}

func (s *Sprofile) Sync() (updated bool, err error) {
	for _, syncHost := range s.SyncHosts {
		updated, err = s.syncProfile(syncHost)
		if err != nil {
			continue
		}

		break
	}

	return
}

func (s *Sprofile) Commit() (err error) {
	prflsPath := GetPath()

	err = platform.MkdirSecure(prflsPath)
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

	cacheStale = true

	return
}

func (s *Sprofile) Delete() (err error) {
	prflPth := s.BasePath() + ".conf"
	logPth1 := s.BasePath() + ".log"
	logPth2 := s.BasePath() + ".log.1"

	_ = utils.Remove(prflPth)
	_ = utils.Remove(logPth1)
	_ = utils.Remove(logPth2)

	return
}

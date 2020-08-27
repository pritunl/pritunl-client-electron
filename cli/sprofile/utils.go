package sprofile

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"net/http"
	"regexp"
	"runtime"
	"strings"
	"time"

	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/cli/errortypes"
	"github.com/pritunl/pritunl-client-electron/cli/profile"
	"github.com/pritunl/pritunl-client-electron/cli/service"
	"github.com/pritunl/pritunl-client-electron/cli/utils"
)

var (
	clientSecure = &http.Client{
		Transport: &http.Transport{
			TLSHandshakeTimeout: 12 * time.Second,
			TLSClientConfig: &tls.Config{
				MinVersion: tls.VersionTLS12,
				MaxVersion: tls.VersionTLS13,
			},
		},
		Timeout: 12 * time.Second,
	}
	clientInsecure = &http.Client{
		Transport: &http.Transport{
			TLSHandshakeTimeout: 12 * time.Second,
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true,
				MinVersion:         tls.VersionTLS12,
				MaxVersion:         tls.VersionTLS13,
			},
		},
		Timeout: 12 * time.Second,
	}
	ip4reg = regexp.MustCompile("/\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}/")
	ip6reg = regexp.MustCompile("/\\[[a-fA-F0-9:]*\\]/")
)

type SprofileData struct {
	Id                 string `json:"id"`
	Mode               string `json:"mode"`
	OrgId              string `json:"org_id"`
	UserId             string `json:"user_id"`
	ServerId           string `json:"server_id"`
	SyncToken          string `json:"sync_token"`
	SyncSecret         string `json:"sync_secret"`
	Data               string `json:"data"`
	Username           string `json:"username"`
	Password           string `json:"password"`
	ServerPublicKey    string `json:"server_public_key"`
	ServerBoxPublicKey string `json:"server_box_public_key"`
	TokenTtl           int    `json:"token_ttl"`
	Reconnect          bool   `json:"reconnect"`
	Timeout            bool   `json:"timeout"`
}

func Match(sprflId string) (sprfl *Sprofile, err error) {
	sprfls, err := GetAll()
	if err != nil {
		return
	}

	for _, spfl := range sprfls {
		if sprflId == spfl.Id {
			sprfl = spfl
		} else if len(sprflId) <= len(spfl.Id) &&
			spfl.Id[:len(sprflId)] == sprflId {

			if sprfl != nil {
				err = errortypes.NotFoundError{
					errors.New("sprofile: Profile duplicate match"),
				}
				return
			}
			sprfl = spfl
		}
	}

	if sprfl == nil {
		err = errortypes.NotFoundError{
			errors.New("sprofile: Profile not found"),
		}
		return
	}

	return
}

func Stop(sprflId string) (err error) {
	sprfl, err := Match(sprflId)
	if err != nil {
		return
	}

	reqUrl := service.GetAddress() + "/profile"

	authKey, err := service.GetAuthKey()
	if err != nil {
		return
	}

	data, err := json.Marshal(&SprofileData{
		Id: sprfl.Id,
	})
	if err != nil {
		err = errortypes.RequestError{
			errors.Wrap(err, "sprofile: Json marshal error"),
		}
		return
	}

	body := bytes.NewBuffer(data)

	req, err := http.NewRequest("DELETE", reqUrl, body)
	if err != nil {
		err = errortypes.RequestError{
			errors.Wrap(err, "sprofile: Delete request failed"),
		}
		return
	}

	if runtime.GOOS == "linux" {
		req.Host = "unix"
	}
	req.Header.Set("Auth-Key", authKey)
	req.Header.Set("User-Agent", "pritunl")
	req.Header.Set("Content-Type", "application/json")

	resp, err := service.GetClient().Do(req)
	if err != nil {
		err = errortypes.RequestError{
			errors.Wrap(err, "sprofile: Request failed"),
		}
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		err = errortypes.RequestError{
			errors.Wrap(err, "sprofile: Unknown request error"),
		}
		return
	}

	return
}

func Delete(sprflId string) (err error) {
	sprfl, err := Match(sprflId)
	if err != nil {
		return
	}

	reqUrl := service.GetAddress() + "/sprofile"

	authKey, err := service.GetAuthKey()
	if err != nil {
		return
	}

	data, err := json.Marshal(&SprofileData{
		Id: sprfl.Id,
	})
	if err != nil {
		err = errortypes.RequestError{
			errors.Wrap(err, "sprofile: Json marshal error"),
		}
		return
	}

	body := bytes.NewBuffer(data)

	req, err := http.NewRequest("DELETE", reqUrl, body)
	if err != nil {
		err = errortypes.RequestError{
			errors.Wrap(err, "sprofile: Delete request failed"),
		}
		return
	}

	if runtime.GOOS == "linux" {
		req.Host = "unix"
	}
	req.Header.Set("Auth-Key", authKey)
	req.Header.Set("User-Agent", "pritunl")
	req.Header.Set("Content-Type", "application/json")

	resp, err := service.GetClient().Do(req)
	if err != nil {
		err = errortypes.RequestError{
			errors.Wrap(err, "sprofile: Request failed"),
		}
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		err = errortypes.RequestError{
			errors.Wrap(err, "sprofile: Unknown request error"),
		}
		return
	}

	return
}

func GetAll() (sprfls []*Sprofile, err error) {
	reqUrl := service.GetAddress() + "/sprofile"

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

	if runtime.GOOS == "linux" {
		req.Host = "unix"
	}
	req.Header.Set("Auth-Key", authKey)
	req.Header.Set("User-Agent", "pritunl")
	req.Header.Set("Content-Type", "application/json")

	resp, err := service.GetClient().Do(req)
	if err != nil {
		err = errortypes.RequestError{
			errors.Wrap(err, "sprofile: Request failed"),
		}
		return
	}
	defer resp.Body.Close()

	sprfls = []*Sprofile{}
	err = json.NewDecoder(resp.Body).Decode(&sprfls)
	if err != nil {
		err = errortypes.ParseError{
			errors.Wrap(err, "sprofile: Failed to parse response"),
		}
		return
	}

	sprflsMap := map[string]*Sprofile{}
	for _, sprfl := range sprfls {
		sprflsMap[sprfl.Id] = sprfl
	}

	prfls, err := profile.GetAll()
	if err != nil {
		return
	}

	for _, prfl := range prfls {
		sprfl := sprflsMap[prfl.Id]
		if sprfl != nil {
			sprfl.Profile = prfl
		}
	}

	return
}

func Start(sprflId, mode, password string) (err error) {
	sprfl, err := Match(sprflId)
	if err != nil {
		return
	}

	if mode == "" {
		mode = sprfl.LastMode
		if mode == "" {
			mode = "ovpn"
		}
	}

	switch mode {
	case "ovpn", "wg":
		break
	default:
		err = errortypes.NotFoundError{
			errors.New("sprofile: Invalid profile mode"),
		}
		return
	}

	reqUrl := service.GetAddress() + "/profile"

	authKey, err := service.GetAuthKey()
	if err != nil {
		return
	}

	data, err := json.Marshal(&SprofileData{
		Id:       sprfl.Id,
		Mode:     mode,
		Password: password,
	})
	if err != nil {
		err = errortypes.RequestError{
			errors.Wrap(err, "sprofile: Json marshal error"),
		}
		return
	}

	body := bytes.NewBuffer(data)

	req, err := http.NewRequest("POST", reqUrl, body)
	if err != nil {
		err = errortypes.RequestError{
			errors.Wrap(err, "sprofile: Post request failed"),
		}
		return
	}

	if runtime.GOOS == "linux" {
		req.Host = "unix"
	}
	req.Header.Set("Auth-Key", authKey)
	req.Header.Set("User-Agent", "pritunl")
	req.Header.Set("Content-Type", "application/json")

	resp, err := service.GetClient().Do(req)
	if err != nil {
		err = errortypes.RequestError{
			errors.Wrap(err, "sprofile: Request failed"),
		}
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		err = errortypes.RequestError{
			errors.Wrap(err, "sprofile: Unknown request error"),
		}
		return
	}

	return
}

func Import(data string) (err error) {
	proflId, err := utils.RandStr(32)
	if err != nil {
		return
	}

	profl := &Sprofile{
		Id: strings.ToLower(proflId),
	}

	jsonData := ""
	jsonFound := false
	jsonLoaded := false

	dataLines := strings.Split(data, "\n")
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
			data += line + "\n"
		}
	}

	if jsonLoaded {
		err = json.Unmarshal([]byte(jsonData), profl)
		if err != nil {
			err = &errortypes.ParseError{
				errors.Wrap(err, "profile: Failed to parse sync conf data"),
			}
			return
		}
	} else {
		err = &errortypes.ParseError{
			errors.Wrap(err, "profile: Conf data missing"),
		}
		return
	}

	profl.OvpnData = data

	reqUrl := service.GetAddress() + "/sprofile"

	authKey, err := service.GetAuthKey()
	if err != nil {
		return
	}

	reqData, err := json.Marshal(profl)
	if err != nil {
		err = errortypes.RequestError{
			errors.Wrap(err, "sprofile: Json marshal error"),
		}
		return
	}

	body := bytes.NewBuffer(reqData)

	req, err := http.NewRequest("PUT", reqUrl, body)
	if err != nil {
		err = errortypes.RequestError{
			errors.Wrap(err, "sprofile: Post request failed"),
		}
		return
	}

	if runtime.GOOS == "linux" {
		req.Host = "unix"
	}
	req.Header.Set("Auth-Key", authKey)
	req.Header.Set("User-Agent", "pritunl")
	req.Header.Set("Content-Type", "application/json")

	resp, err := service.GetClient().Do(req)
	if err != nil {
		err = errortypes.RequestError{
			errors.Wrap(err, "sprofile: Request failed"),
		}
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		err = errortypes.RequestError{
			errors.Wrapf(
				err,
				"sprofile: Unknown request error %d",
				resp.StatusCode,
			),
		}
		return
	}

	return
}

func ImportUri(uri string) (err error) {
	uri = strings.Replace(uri, "pritunl://", "https://", 1)
	uri = strings.Replace(uri, "/k/", "/ku/", 1)

	req, err := http.NewRequest(
		"GET",
		uri,
		nil,
	)
	if err != nil {
		err = &errortypes.RequestError{
			errors.Wrap(err, "profile: Sync profile request error"),
		}
		return
	}

	req.Header.Set("User-Agent", "pritunl")

	var client *http.Client
	if len(ip4reg.FindAllString(uri, -1)) > 1 ||
		len(ip6reg.FindAllString(uri, -1)) > 1 {

		client = clientInsecure
	} else {
		client = clientSecure
	}

	resp, err := client.Do(req)
	if err != nil {
		err = errortypes.RequestError{
			errors.Wrap(err, "sprofile: Request failed"),
		}
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 404 {
		err = errortypes.RequestError{
			errors.Wrap(err, "sprofile: Invalid profile uri"),
		}
		return
	}

	if resp.StatusCode != 200 {
		err = errortypes.RequestError{
			errors.Wrapf(
				err,
				"sprofile: Unknown profile uri error %d",
				resp.StatusCode,
			),
		}
		return
	}

	data := map[string]string{}
	err = json.NewDecoder(resp.Body).Decode(&data)
	if err != nil {
		err = &errortypes.ParseError{
			errors.Wrap(err, "sprofile: Failed to parse uri response body"),
		}
		return
	}

	for _, proflData := range data {
		err = Import(proflData)
		if err != nil {
			return
		}
	}

	return
}

package sprofile

import (
	"bytes"
	"encoding/json"
	"net/http"
	"runtime"

	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/cli/errortypes"
	"github.com/pritunl/pritunl-client-electron/cli/profile"
	"github.com/pritunl/pritunl-client-electron/cli/service"
)

func Stop(sprflId string) (err error) {
	sprfls, err := GetAll()
	if err != nil {
		return
	}

	var matched *Sprofile
	for _, sprfl := range sprfls {
		if sprflId == sprfl.Id {
			matched = sprfl
		} else if len(sprflId) <= len(sprfl.Id) &&
			sprfl.Id[:len(sprflId)] == sprflId {

			if matched != nil {
				err = errortypes.NotFoundError{
					errors.Wrap(err, "sprofile: Profile duplicate match"),
				}
				return
			}
			matched = sprfl
		}
	}

	if matched == nil {
		err = errortypes.NotFoundError{
			errors.Wrap(err, "sprofile: Profile not found"),
		}
		return
	}

	reqUrl := service.GetAddress() + "/profile"

	authKey, err := service.GetAuthKey()
	if err != nil {
		return
	}

	data, err := json.Marshal(&Sprofile{
		Id: matched.Id,
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

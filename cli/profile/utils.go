package profile

import (
	"encoding/json"
	"net/http"
	"runtime"

	"github.com/dhurley94/pritunl-client-electron/cli/errortypes"
	"github.com/dhurley94/pritunl-client-electron/cli/service"
	"github.com/dropbox/godropbox/errors"
)

func GetAll() (prfls map[string]*Profile, err error) {
	reqUrl := service.GetAddress() + "/profile"

	authKey, err := service.GetAuthKey()
	if err != nil {
		return
	}

	req, err := http.NewRequest("GET", reqUrl, nil)
	if err != nil {
		err = errortypes.RequestError{
			errors.Wrap(err, "profile: Get request failed"),
		}
		return
	}

	if runtime.GOOS == "linux" || runtime.GOOS == "darwin" {
		req.Host = "unix"
	}
	req.Header.Set("Auth-Key", authKey)
	req.Header.Set("User-Agent", "pritunl")
	req.Header.Set("Content-Type", "application/json")

	resp, err := service.GetClient().Do(req)
	if err != nil {
		err = errortypes.RequestError{
			errors.Wrap(err, "profile: Request failed"),
		}
		return
	}
	defer resp.Body.Close()

	prfls = map[string]*Profile{}
	err = json.NewDecoder(resp.Body).Decode(&prfls)
	if err != nil {
		err = errortypes.ParseError{
			errors.Wrap(err, "profile: Failed to parse response"),
		}
		return
	}

	return
}

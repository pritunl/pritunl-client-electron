package update

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/constants"
	"github.com/pritunl/pritunl-client-electron/service/errortypes"
)

var (
	Upgrade bool

	lastCheck time.Time
	client    = &http.Client{
		Transport: &http.Transport{
			TLSHandshakeTimeout: 30 * time.Second,
			TLSClientConfig: &tls.Config{
				MinVersion: tls.VersionTLS12,
				MaxVersion: tls.VersionTLS13,
			},
		},
		Timeout: 30 * time.Second,
	}
)

type updateRespData struct {
	Upgrade bool `json:"upgrade"`
}

func Check() (err error) {
	if time.Since(lastCheck) < 3*time.Hour {
		return
	}

	req, err := http.NewRequest(
		"GET",
		fmt.Sprintf(
			"https://app.pritunl.com/update/%s",
			constants.Version,
		),
		nil,
	)
	if err != nil {
		err = &errortypes.RequestError{
			errors.Wrap(err, "update: Update error"),
		}
		return
	}

	req.Header.Set("User-Agent", "pritunl-client")

	res, err := client.Do(req)
	if err != nil {
		err = &errortypes.RequestError{
			errors.Wrap(err, "update: Update request error"),
		}
		return
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		err = &errortypes.RequestError{
			errors.Wrapf(err, "update: Bad status %d code from update server",
				res.StatusCode),
		}
		return
	}

	data := &updateRespData{}
	err = json.NewDecoder(res.Body).Decode(data)
	if err != nil {
		err = &errortypes.ParseError{
			errors.Wrap(err, "update: Failed to parse response body"),
		}
		return
	}

	Upgrade = data.Upgrade
	lastCheck = time.Now()

	return
}

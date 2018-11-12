package token

import (
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"time"
)

type Token struct {
	Profile         string    `json:"profile"`
	ServerPublicKey string    `json:"-"`
	Token           string    `json:"-"`
	Timestamp       time.Time `json:"timestamp"`
	Ttl             int       `json:"ttl"`
	Valid           bool      `json:"valid"`
}

func (t *Token) Init() (err error) {
	t.Valid = false

	token, err := utils.RandStr(64)
	if err != nil {
		return
	}

	t.Token = token
	t.Timestamp = time.Now()

	return
}

func (t *Token) Update() (err error) {
	if time.Since(t.Timestamp) > time.Duration(t.Ttl)*time.Second {
		err = t.Init()
		if err != nil {
			return
		}
	}

	return
}

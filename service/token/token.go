package token

import (
	"time"

	"github.com/Sirupsen/logrus"
	"github.com/pritunl/pritunl-client-electron/service/utils"
)

type Token struct {
	Profile            string    `json:"profile"`
	ServerPublicKey    string    `json:"-"`
	ServerBoxPublicKey string    `json:"-"`
	Token              string    `json:"-"`
	Timestamp          time.Time `json:"timestamp"`
	Ttl                int       `json:"ttl"`
	Valid              bool      `json:"valid"`
}

func (t *Token) Init() (err error) {
	logrus.WithFields(logrus.Fields{
		"profile": t.Profile,
	}).Info("token: Token init")

	t.Valid = false

	token, err := utils.RandStrComplex(16)
	if err != nil {
		return
	}

	t.Token = token
	t.Timestamp = time.Now()

	return
}

func (t *Token) Reset() (err error) {
	logrus.WithFields(logrus.Fields{
		"profile": t.Profile,
	}).Info("token: Token reset")

	t.Valid = false

	token, err := utils.RandStrComplex(16)
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

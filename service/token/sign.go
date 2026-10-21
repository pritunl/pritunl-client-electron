package token

import (
	"crypto/rand"
	"encoding/base64"
	"strconv"
	"strings"

	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client/service/errortypes"
	"golang.org/x/crypto/nacl/sign"
)

type SignKey struct {
	publicKey  *[32]byte
	privateKey *[64]byte
}

func NewSignKey() (key *SignKey, err error) {
	publicKey, privateKey, err := sign.GenerateKey(rand.Reader)
	if err != nil {
		err = &errortypes.ReadError{
			errors.Wrap(err, "token: Failed to generate nacl sign key"),
		}
		return
	}

	key = &SignKey{
		publicKey:  publicKey,
		privateKey: privateKey,
	}

	return
}

func (k *SignKey) PublicKey() string {
	return base64.StdEncoding.EncodeToString(k.publicKey[:])
}

func (k *SignKey) Sign(token, nonce string, timestamp int64) string {
	data := []byte(strings.Join([]string{
		token,
		nonce,
		strconv.FormatInt(timestamp, 10),
	}, "&"))

	signed := sign.Sign(nil, data, k.privateKey)

	return base64.StdEncoding.EncodeToString(signed[:sign.Overhead])
}

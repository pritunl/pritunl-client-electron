package auth

import (
	"github.com/dropbox/godropbox/errors"
)

type ReadError struct {
	errors.DropboxError
}

type WriteError struct {
	errors.DropboxError
}

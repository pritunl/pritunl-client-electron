package autoclean

import (
	"github.com/dropbox/godropbox/errors"
)

type RemoveError struct {
	errors.DropboxError
}

type ParseError struct {
	errors.DropboxError
}

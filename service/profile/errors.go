package profile

import (
	"github.com/dropbox/godropbox/errors"
)

type WriteError struct {
	errors.DropboxError
}

type ExecError struct {
	errors.DropboxError
}

package logger

import (
	"github.com/dropbox/godropbox/errors"
)

type WriteError struct {
	errors.DropboxError
}

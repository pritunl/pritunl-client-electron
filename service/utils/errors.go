package utils

import (
	"github.com/dropbox/godropbox/errors"
)

type CommandError struct {
	errors.DropboxError
}

type IoError struct {
	errors.DropboxError
}

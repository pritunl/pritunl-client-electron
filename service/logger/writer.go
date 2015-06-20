package logger

import (
	"github.com/Sirupsen/logrus"
)

type ErrorWriter struct{}

func (w *ErrorWriter) Write(input []byte) (n int, err error) {
	n = len(input)
	logrus.Error(string(input))
	return
}

// Returns a writer for writing to error log
func NewErrorWriter() (errWr *ErrorWriter) {
	errWr = &ErrorWriter{}
	return
}

package logger

import (
	"github.com/sirupsen/logrus"
)

type sender interface {
	Init()
	Parse(entry *logrus.Entry)
}

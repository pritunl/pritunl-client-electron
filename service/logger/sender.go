package logger

import (
	"github.com/Sirupsen/logrus"
)

type sender interface {
	Init()
	Parse(entry *logrus.Entry)
}

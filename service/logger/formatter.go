package logger

import (
	"fmt"
	"github.com/Sirupsen/logrus"
)

type formatter struct{}

func (f *formatter) Format(entry *logrus.Entry) (output []byte, err error) {
	msg := fmt.Sprintf("%s%s ▶ %s",
		formatTime(entry.Time), formatLevel(entry.Level), entry.Message)

	var errStr string
	for key, val := range entry.Data {
		if key == "error" {
			errStr = fmt.Sprintf("%s", val)
			continue
		}

		msg += fmt.Sprintf(" ◆ %s=%v", key, fmt.Sprintf("%#v", val))
	}

	if errStr != "" {
		msg += "\n" + errStr
	}

	if string(msg[len(msg)-1]) != "\n" {
		msg += "\n"
	}

	output = []byte(msg)

	return
}

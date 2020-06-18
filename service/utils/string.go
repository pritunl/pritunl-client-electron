package utils

import (
	"regexp"
)

var (
	alphaNumRe = regexp.MustCompile("[^a-zA-Z0-9]+")
)

func FilterStr(input string) string {
	return string(alphaNumRe.ReplaceAll([]byte(input), []byte("")))
}

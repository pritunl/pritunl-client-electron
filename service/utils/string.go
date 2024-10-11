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

func FilterStrN(input string, n int) string {
	str := string(alphaNumRe.ReplaceAll([]byte(input), []byte("")))
	if len(str) > n {
		str = str[:n]
	}
	return str
}

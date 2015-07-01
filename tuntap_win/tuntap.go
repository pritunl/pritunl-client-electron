package main

import (
	"os"
	"path/filepath"
)

func main() {
	rootDir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		panic(err)
	}

	tuntapPath := ""
	if os.Getenv("PROGRAMFILES(X86)") == "" {
		tuntapPath = filepath.Join(rootDir, "32", "tapinstall.exe")
	} else {
		tuntapPath = filepath.Join(rootDir, "64", "tapinstall.exe")
	}

	_ = tuntapPath
}

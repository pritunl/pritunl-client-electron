package main

import (
	"os"
	"os/exec"
	"path/filepath"
)

func main() {
	rootDir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		panic(err)
	}

	tuntapDir := ""
	if os.Getenv("PROGRAMFILES(X86)") == "" {
		tuntapDir = filepath.Join(rootDir, "32")
	} else {
		tuntapDir = filepath.Join(rootDir, "64")
	}

	cmd := &exec.Cmd{
		Path: "tapinstall.exe",
		Dir:  tuntapDir,
		Args: []string{
			"install",
			"OemVista.inf",
			"tap0901",
		},
	}

	err = cmd.Run()
	if err != nil {
		panic(err)
	}
}

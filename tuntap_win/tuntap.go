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

	if os.Args[1] == "install" {
		cmd := exec.Command(
			"tapinstall.exe",
			"install",
			"OemVista.inf",
			"tap0901",
		)
		cmd.Dir = tuntapDir

		err = cmd.Run()
		if err != nil {
			panic(err)
		}
	} else {
		cmd := exec.Command(
			"tapinstall.exe",
			"remove",
			"tap0901",
		)
		cmd.Dir = tuntapDir

		err = cmd.Run()
		if err != nil {
			panic(err)
		}
	}
}

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

	tapInstallPath := filepath.Join(rootDir, "tapinstall.exe")

	if os.Args[1] == "install" {
		cmd := exec.Command(
			tapInstallPath,
			"install",
			"OemVista.inf",
			"tap0901",
		)
		cmd.Dir = rootDir

		err = cmd.Run()
		if err != nil {
			panic(err)
		}
	} else {
		cmd := exec.Command(
			tapInstallPath,
			"remove",
			"tap0901",
		)
		cmd.Dir = rootDir

		err = cmd.Run()
		if err != nil {
			panic(err)
		}
	}
}

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

	cmd := exec.Command("taskkill.exe", "/F", "/IM", "pritunl.exe")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()
	cmd = exec.Command(filepath.Join(rootDir, "sc.exe"),
		"stop", "pritunl")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()
	cmd = exec.Command(filepath.Join(rootDir, "sc.exe"),
		"delete", "pritunl")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()

	cmd = exec.Command(filepath.Join(rootDir, "tuntap", "tuntap.exe"),
		"clean")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()
	cmd = exec.Command(filepath.Join(rootDir, "tuntap", "tuntap.exe"),
		"uninstall")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()
}

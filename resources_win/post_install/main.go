package main

import (
	"fmt"
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
	cmd = exec.Command("sc.exe", "stop", "pritunl")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()

	cmd = exec.Command(filepath.Join(rootDir, "tuntap", "tuntap.exe"),
		"install")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()
	cmd = exec.Command(filepath.Join(rootDir, "tuntap", "tuntap.exe"),
		"clean")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()

	cmd = exec.Command(
		"sc.exe",
		"create", "pritunl",
		"start=auto",
		"displayname=Pritunl Client Helper Service",
		fmt.Sprintf(`binpath="%s"`,
			filepath.Join(rootDir, "pritunl-service.exe")),
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()

	cmd = exec.Command(
		"sc.exe",
		"config", "pritunl",
		"start=auto",
		"displayname=Pritunl Client Helper Service",
		fmt.Sprintf(`binpath="%s"`,
			filepath.Join(rootDir, "pritunl-service.exe")),
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()

	cmd = exec.Command("sc.exe", "start", "pritunl")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()
}

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

	exec.Command(filepath.Join(rootDir, "nssm.exe"),
		"remove", "pritunl", "confirm").Run()
	exec.Command(filepath.Join(rootDir, "tuntap", "tuntap.exe"),
		"uninstall").Run()
	exec.Command(filepath.Join(rootDir, "tuntap", "tuntap.exe"),
		"install").Run()
	exec.Command(filepath.Join(rootDir, "tuntap", "tuntap.exe"),
		"install").Run()
	exec.Command(filepath.Join(rootDir, "tuntap", "tuntap.exe"),
		"install").Run()
	exec.Command(filepath.Join(rootDir, "tuntap", "tuntap.exe"),
		"install").Run()
	exec.Command(filepath.Join(rootDir, "nssm.exe"), "install", "pritunl",
		filepath.Join(rootDir, "pritunl-service.exe")).Run()
	exec.Command(filepath.Join(rootDir, "nssm.exe"),
		"set", "pritunl", "DisplayName", "Pritunl Helper Service").Run()
	exec.Command(filepath.Join(rootDir, "nssm.exe"),
		"set", "pritunl", "Start", "SERVICE_AUTO_START").Run()
	exec.Command(filepath.Join(rootDir, "nssm.exe"),
		"set", "pritunl", "AppStdout",
		"C:\\ProgramData\\Pritunl\\service.log").Run()
	exec.Command(filepath.Join(rootDir, "nssm.exe"),
		"set", "pritunl", "AppStderr",
		"C:\\ProgramData\\Pritunl\\service.log").Run()
	exec.Command(filepath.Join(rootDir, "nssm.exe"),
		"set", "pritunl", "Start", "SERVICE_AUTO_START").Run()
	exec.Command(filepath.Join(rootDir, "nssm.exe"),
		"start", "pritunl").Run()
}

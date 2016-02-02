package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"sync"
)

func main() {
	wait := &sync.WaitGroup{}

	rootDir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		panic(err)
	}

	cmd := exec.Command(filepath.Join(rootDir, "nssm.exe"),
		"stop", "pritunl")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()

	wait.Add(1)
	go func() {
		defer wait.Done()

		cmd := exec.Command(filepath.Join(rootDir, "tuntap", "tuntap.exe"),
			"uninstall")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		cmd.Run()
		cmd = exec.Command(filepath.Join(rootDir, "tuntap", "tuntap.exe"),
			"install")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		cmd.Run()
		cmd = exec.Command(filepath.Join(rootDir, "tuntap", "tuntap.exe"),
			"install")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		cmd.Run()
		cmd = exec.Command(filepath.Join(rootDir, "tuntap", "tuntap.exe"),
			"install")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		cmd.Run()
		cmd = exec.Command(filepath.Join(rootDir, "tuntap", "tuntap.exe"),
			"install")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		cmd.Run()
		cmd = exec.Command(filepath.Join(rootDir, "tuntap", "tuntap.exe"),
			"install")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		cmd.Run()
		cmd = exec.Command(filepath.Join(rootDir, "tuntap", "tuntap.exe"),
			"install")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		cmd.Run()
		cmd = exec.Command(filepath.Join(rootDir, "tuntap", "tuntap.exe"),
			"install")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		cmd.Run()
	}()

	cmd = exec.Command(filepath.Join(rootDir, "nssm.exe"),
		"remove", "pritunl", "confirm")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()
	cmd = exec.Command(filepath.Join(rootDir, "nssm.exe"), "install",
		"pritunl", filepath.Join(rootDir, "pritunl-service.exe"))
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()
	cmd = exec.Command(filepath.Join(rootDir, "nssm.exe"),
		"set", "pritunl", "DisplayName", "Pritunl Helper Service")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()
	cmd = exec.Command(filepath.Join(rootDir, "nssm.exe"),
		"set", "pritunl", "Start", "SERVICE_AUTO_START")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()
	cmd = exec.Command(filepath.Join(rootDir, "nssm.exe"),
		"set", "pritunl", "AppStdout",
		"C:\\ProgramData\\Pritunl\\service.log")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()
	cmd = exec.Command(filepath.Join(rootDir, "nssm.exe"),
		"set", "pritunl", "AppStderr",
		"C:\\ProgramData\\Pritunl\\service.log")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()
	cmd = exec.Command(filepath.Join(rootDir, "nssm.exe"),
		"set", "pritunl", "Start", "SERVICE_AUTO_START")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()
	cmd = exec.Command(filepath.Join(rootDir, "nssm.exe"),
		"start", "pritunl")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Run()

	wait.Wait()
}

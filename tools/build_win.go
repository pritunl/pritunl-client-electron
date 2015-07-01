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

	err = os.Chdir(filepath.Join(rootDir, "tuntap"))
	if err != nil {
		panic(err)
	}

	cmd := &exec.Cmd{
		Path: "go",
		Args: []string{
			"build",
			"-v",
			"-a",
			"-o tuntap.exe",
		},
		Stdout: os.Stdout,
		Stderr: os.Stderr,
	}
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	err = os.Chdir(filepath.Join(rootDir, "service"))
	if err != nil {
		panic(err)
	}

	cmd = &exec.Cmd{
		Path: "go",
		Args: []string{
			"get",
			"-u",
			"-f",
		},
		Stdout: os.Stdout,
		Stderr: os.Stderr,
	}
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	cmd = &exec.Cmd{
		Path: "go",
		Args: []string{
			"build",
			"-v",
			"-a",
		},
		Stdout: os.Stdout,
		Stderr: os.Stderr,
	}
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	err = os.Chdir(filepath.Join(rootDir, "client"))
	if err != nil {
		panic(err)
	}

	cmd = &exec.Cmd{
		Path: "npm",
		Args: []string{
			"install",
		},
		Stdout: os.Stdout,
		Stderr: os.Stderr,
	}
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	cmd = &exec.Cmd{
		Path: ".\\node_modules\\.bin\\electron-rebuild",
		Args: []string{
			"install",
		},
		Stdout: os.Stdout,
		Stderr: os.Stderr,
	}
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	cmd = &exec.Cmd{
		Path: ".\\node_modules\\.bin\\electron-packager",
		Args: []string{
			".\\",
			"pritunl",
			"--platform=win32",
			"--arch=ia32",
			"--version=0.28.3",
			"--icon=www\\img\\logo.ico",
			"--out=..\\build\\win",
			"--prune",
			"--asar",
		},
		Stdout: os.Stdout,
		Stderr: os.Stderr,
	}
	err = cmd.Run()
	if err != nil {
		panic(err)
	}
}

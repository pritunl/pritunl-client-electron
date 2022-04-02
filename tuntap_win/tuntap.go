package main

import (
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"strings"
)

func ExecOutput(dir, name string, arg ...string) (output string, err error) {
	cmd := exec.Command(name, arg...)
	cmd.Dir = dir
	cmd.Stderr = os.Stderr

	outputByt, err := cmd.Output()
	if err != nil {
		return
	}
	output = string(outputByt)

	return
}

func Get(rootDir string) (adpaters []string, err error) {
	toolpath := path.Join(rootDir, "tapctl.exe")

	output, err := ExecOutput(
		rootDir,
		toolpath,
		"list",
	)
	if err != nil {
		return
	}

	adpaters = []string{}
	for _, line := range strings.Split(output, "\n") {
		lines := strings.Fields(line)
		if len(lines) < 2 {
			continue
		}

		name := strings.ToLower(lines[1])

		if name != "ethernet" && name != "local" && name != "pritunl" {
			continue
		}

		adpaters = append(adpaters, lines[0])
	}

	return
}

func Clean(rootDir string) (err error) {
	toolpath := path.Join(rootDir, "tapctl.exe")

	adapters, err := Get(rootDir)
	if err != nil {
		return
	}

	for _, adapter := range adapters {
		cmd := exec.Command(
			toolpath,
			"delete",
			adapter,
		)
		cmd.Dir = rootDir

		err = cmd.Run()
		if err != nil {
			panic(err)
		}
	}

	return
}

func main() {
	rootDir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		panic(err)
	}

	if os.Args[1] == "install" {
		cmd := exec.Command(
			"pnputil.exe",
			"-a", "oemvista.inf",
			"-i",
		)
		cmd.Dir = rootDir

		err = cmd.Run()
		if err != nil {
			panic(err)
		}
	} else {
		err = Clean(rootDir)
		if err != nil {
			panic(err)
		}
	}
}

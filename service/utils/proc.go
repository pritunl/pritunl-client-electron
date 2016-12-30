package utils

import (
	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/errortypes"
	"io"
	"os"
	"os/exec"
)

func Exec(dir, name string, arg ...string) (err error) {
	cmd := exec.Command(name, arg...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if dir != "" {
		cmd.Dir = dir
	}

	err = cmd.Run()
	if err != nil {
		err = &errortypes.ExecError{
			errors.Wrapf(err, "utils: Failed to exec '%s'", name),
		}
		return
	}

	return
}

func ExecInput(dir, input, name string, arg ...string) (err error) {
	cmd := exec.Command(name, arg...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	stdin, err := cmd.StdinPipe()
	if err != nil {
		err = &errortypes.ExecError{
			errors.Wrapf(err, "utils: Failed to get stdin in exec '%s'", name),
		}
		return
	}
	defer stdin.Close()

	if dir != "" {
		cmd.Dir = dir
	}

	err = cmd.Start()
	if err != nil {
		err = &errortypes.ExecError{
			errors.Wrapf(err, "utils: Failed to exec '%s'", name),
		}
		return
	}

	_, err = io.WriteString(stdin, input)
	if err != nil {
		err = &errortypes.ExecError{
			errors.Wrapf(err, "utils: Failed to write stdin in exec '%s'",
				name),
		}
		return
	}

	err = cmd.Wait()
	if err != nil {
		err = &errortypes.ExecError{
			errors.Wrapf(err, "utils: Failed to exec '%s'", name),
		}
		return
	}

	return
}

func ExecOutput(dir, name string, arg ...string) (output string, err error) {
	cmd := exec.Command(name, arg...)
	cmd.Stderr = os.Stderr

	if dir != "" {
		cmd.Dir = dir
	}

	outputByt, err := cmd.Output()
	if err != nil {
		err = &errortypes.ExecError{
			errors.Wrapf(err, "utils: Failed to exec '%s'", name),
		}
		return
	}
	output = string(outputByt)

	return
}

package utils

import (
	"bytes"
	"io"
	"os"
	"os/exec"
	"strings"

	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/command"
	"github.com/pritunl/pritunl-client-electron/service/errortypes"
	"github.com/sirupsen/logrus"
)

func Exec(name string, arg ...string) (err error) {
	cmd := command.Command(name, arg...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err = cmd.Run()
	if err != nil {
		err = &errortypes.ExecError{
			errors.Wrapf(err, "utils: Failed to exec '%s'", name),
		}
		return
	}

	return
}

func ExecInput(input, name string, arg ...string) (err error) {
	cmd := command.Command(name, arg...)
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

func ExecInputOutput(input, name string, arg ...string) (
	output string, err error) {

	var stdout bytes.Buffer

	cmd := command.Command(name, arg...)
	cmd.Stdout = &stdout
	cmd.Stderr = os.Stderr

	stdin, err := cmd.StdinPipe()
	if err != nil {
		err = &errortypes.ExecError{
			errors.Wrapf(err, "utils: Failed to get stdin in exec '%s'", name),
		}
		return
	}

	err = cmd.Start()
	if err != nil {
		stdin.Close()
		err = &errortypes.ExecError{
			errors.Wrapf(err, "utils: Failed to exec '%s'", name),
		}
		return
	}

	_, err = io.WriteString(stdin, input)
	if err != nil {
		stdin.Close()
		err = &errortypes.ExecError{
			errors.Wrapf(err, "utils: Failed to write stdin in exec '%s'",
				name),
		}
		return
	}
	stdin.Close()

	err = cmd.Wait()
	if err != nil {
		err = &errortypes.ExecError{
			errors.Wrapf(err, "utils: Failed to exec '%s'", name),
		}
		return
	}

	output = string(stdout.Bytes())

	return
}

func ExecOutput(name string, arg ...string) (output string, err error) {
	cmd := command.Command(name, arg...)
	cmd.Stderr = os.Stderr

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

func ExecOutputLogged(ignores []string, name string, arg ...string) (
	output string, err error) {

	cmd := exec.Command(name, arg...)

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}

	cmd.Stdout = stdout
	cmd.Stderr = stderr

	err = cmd.Run()
	output = stdout.String()
	errOutput := stderr.String()

	if err != nil && ignores != nil {
		for _, ignore := range ignores {
			if strings.Contains(output, ignore) ||
				strings.Contains(errOutput, ignore) {

				err = nil
				break
			}
		}
	}
	if err != nil {
		err = &errortypes.ExecError{
			errors.Wrapf(err, "utils: Failed to exec '%s'", name),
		}

		logrus.WithFields(logrus.Fields{
			"output":       output,
			"error_output": errOutput,
			"cmd":          name,
			"arg":          arg,
			"error":        err,
		}).Error("utils: Process exec error")
		return
	}

	return
}

func ExecCombinedOutput(name string, arg ...string) (
	output string, err error) {

	cmd := exec.Command(name, arg...)

	outputByt, err := cmd.CombinedOutput()
	if outputByt != nil {
		output = string(outputByt)
	}
	if err != nil {
		err = &errortypes.ExecError{
			errors.Wrapf(err, "utils: Failed to exec '%s'", name),
		}
		return
	}

	return
}

func ExecCombinedOutputLogged(ignores []string, name string, arg ...string) (
	output string, err error) {

	cmd := exec.Command(name, arg...)

	outputByt, err := cmd.CombinedOutput()
	if outputByt != nil {
		output = string(outputByt)
	}

	if err != nil && ignores != nil {
		for _, ignore := range ignores {
			if strings.Contains(output, ignore) {
				err = nil
				output = ""
				break
			}
		}
	}
	if err != nil {
		err = &errortypes.ExecError{
			errors.Wrapf(err, "utils: Failed to exec '%s'", name),
		}

		logrus.WithFields(logrus.Fields{
			"output": output,
			"cmd":    name,
			"arg":    arg,
			"error":  err,
		}).Error("utils: Process exec error")
		return
	}

	return
}

package terminal

import (
	"fmt"
	"os"
	"syscall"

	"golang.org/x/term"
)

func ReadPassword() string {
	fmt.Print("Password: ")

	passwordByt, err := term.ReadPassword(syscall.Stdin)
	if err != nil {
		fmt.Println("")
		fmt.Fprintln(os.Stderr, "\ncmd: Failed to read password")
		return ""
	}
	fmt.Println("")

	return string(passwordByt)
}

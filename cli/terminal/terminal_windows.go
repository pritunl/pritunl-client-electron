package terminal

import (
	"fmt"
	"os"
)

func ReadPassword() string {
	fmt.Print("Password: ")

	password := ""
	_, err := fmt.Scanln(&password)
	if err != nil {
		fmt.Println("")
		fmt.Fprintln(os.Stderr, "cmd: Failed to read password")
		return
	}
	fmt.Println("")

	return password
}

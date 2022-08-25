package cmd

import (
	"fmt"
	"os"
	"syscall"

	"github.com/pritunl/pritunl-client-electron/cli/sprofile"
	"github.com/spf13/cobra"
	"golang.org/x/term"
)

var StartCmd = &cobra.Command{
	Use:   "start [profile_id]",
	Short: "Start profile",
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) == 0 {
			fmt.Fprintln(os.Stderr, "cmd: Missing profile ID")
			return
		}

		if passwordPrompt {
			fmt.Print("Password: ")
			passwordByt, err := term.ReadPassword(syscall.Stdin)
			if err != nil {
				fmt.Fprintln(os.Stderr, "cmd: Failed to read password")
				return
			}
			fmt.Println("")

			password = string(passwordByt)
		}

		err := sprofile.Start(args[0], mode, password)
		if err != nil {
			panic(err)
		}
	},
}

package cmd

import (
	"fmt"
	"os"

	"github.com/pritunl/pritunl-client-electron/cli/sprofile"
	"github.com/pritunl/pritunl-client-electron/cli/terminal"
	"github.com/spf13/cobra"
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
			password = terminal.ReadPassword()
			if password == "" {
				return
			}
		}

		err := sprofile.Start(args[0], mode, password)
		if err != nil {
			panic(err)
		}
	},
}

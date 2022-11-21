package cmd

import (
	"github.com/pritunl/pritunl-client-electron/cli/sprofile"
	"github.com/pritunl/pritunl-client-electron/cli/terminal"
	"github.com/spf13/cobra"
)

var StartCmd = &cobra.Command{
	Use:   "start [profile_id]",
	Short: "Start profile",
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) == 0 {
			cobra.CheckErr("cmd: Missing profile ID")
		}

		if passwordPrompt {
			password = terminal.ReadPassword()
			if password == "" {
				cobra.CheckErr("cmd: Password is empty")
			}
		}

		err := sprofile.Start(args[0], mode, password)
		cobra.CheckErr(err)
	},
}

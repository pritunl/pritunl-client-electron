package cmd

import (
	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/cli/errortypes"
	"github.com/spf13/cobra"
)

var RootCmd = &cobra.Command{
	Use:   "pritunl-client",
	Short: "Pritunl Client Command Line Tool",
	Run: func(cmd *cobra.Command, args []string) {
		err := cmd.Help()
		if err != nil {
			err = &errortypes.ExecError{
				errors.Wrap(err, "cmd: Failed to execute help command"),
			}
			panic(err)
		}
	},
}

func Execute() {
	err := RootCmd.Execute()
	if err != nil {
		err = &errortypes.ExecError{
			errors.Wrap(err, "cmd: Failed to execute root command"),
		}
		panic(err)
	}
}

func init() {
	RootCmd.AddCommand(VersionCmd)
}

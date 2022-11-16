package cmd

import (
	"github.com/dropbox/godropbox/errors"
	"github.com/spf13/cobra"
)

var RootCmd = &cobra.Command{
	Use:   "pritunl-client",
	Short: "Pritunl Client Command Line Tool",
	Run: func(cmd *cobra.Command, args []string) {
		err := cmd.Help()
		if err != nil {
			cobra.CheckErr(errors.Wrap(err, "cmd: Failed to execute help command"))
		}
	},
}

func Execute() {
	err := RootCmd.Execute()
	if err != nil {
		cobra.CheckErr(errors.Wrap(err, "cmd: Failed to execute root command"))
	}
}

func init() {
	RootCmd.AddCommand(VersionCmd)
	RootCmd.AddCommand(AddCmd)
	RootCmd.AddCommand(RemoveCmd)
	RootCmd.AddCommand(EnableCmd)
	RootCmd.AddCommand(DisableCmd)
	RootCmd.AddCommand(LogsCmd)
	RootCmd.AddCommand(ListCmd)
	RootCmd.AddCommand(StartCmd)
	RootCmd.AddCommand(StopCmd)
	RootCmd.AddCommand(WatchCmd)
}

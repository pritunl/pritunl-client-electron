package cmd

import (
	"github.com/dhurley94/pritunl-client-electron/cli/watch"
	"github.com/spf13/cobra"
)

var WatchCmd = &cobra.Command{
	Use:   "watch",
	Short: "Watch profiles",
	Run: func(cmd *cobra.Command, args []string) {
		err := watch.Init()
		if err != nil {
			panic(err)
			return
		}
	},
}

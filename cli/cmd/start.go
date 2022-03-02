package cmd

import (
	"github.com/dhurley94/pritunl-client-electron/cli/errortypes"
	"github.com/dhurley94/pritunl-client-electron/cli/sprofile"
	"github.com/dropbox/godropbox/errors"
	"github.com/spf13/cobra"
)

var StartCmd = &cobra.Command{
	Use:   "start [profile_id]",
	Short: "Start profile",
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) == 0 {
			err := errortypes.NotFoundError{
				errors.New("cmd: Missing profile ID"),
			}
			panic(err)
		}

		err := sprofile.Start(args[0], mode, password)
		if err != nil {
			panic(err)
			return
		}
	},
}

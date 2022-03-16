package cmd

import (
	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/cli/errortypes"
	"github.com/pritunl/pritunl-client-electron/cli/sprofile"
	"github.com/spf13/cobra"
)

var EnableCmd = &cobra.Command{
	Use:   "enable [profile_id]",
	Short: "Enable autostart for profile",
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) == 0 {
			err := errortypes.NotFoundError{
				errors.New("cmd: Missing profile ID"),
			}
			panic(err)
		}

		err := sprofile.SetState(args[0], true)
		if err != nil {
			panic(err)
			return
		}
	},
}

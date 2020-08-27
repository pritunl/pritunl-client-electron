package cmd

import (
	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/cli/errortypes"
	"github.com/pritunl/pritunl-client-electron/cli/sprofile"
	"github.com/spf13/cobra"
)

var AddCmd = &cobra.Command{
	Use:   "add [profile_uri]",
	Short: "Add profile",
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) == 0 {
			err := errortypes.NotFoundError{
				errors.New("cmd: Missing profile URI"),
			}
			panic(err)
		}

		err := sprofile.ImportUri(args[0])
		if err != nil {
			panic(err)
			return
		}
	},
}

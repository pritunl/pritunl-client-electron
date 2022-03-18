package cmd

import (
	"strings"

	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/cli/errortypes"
	"github.com/pritunl/pritunl-client-electron/cli/sprofile"
	"github.com/spf13/cobra"
)

var AddCmd = &cobra.Command{
	Use:   "add [profile_uri|tar_path]",
	Short: "Add profile",
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) == 0 {
			err := errortypes.NotFoundError{
				errors.New("cmd: Missing profile URI or path"),
			}
			panic(err)
		}

		path := args[0]
		if strings.HasPrefix(path, "http://") ||
			strings.HasPrefix(path, "https://") ||
			strings.HasPrefix(path, "pritunl://") ||
			strings.HasPrefix(path, "pritunls://") {

			err := sprofile.ImportUri(path)
			if err != nil {
				panic(err)
				return
			}
		} else {
			err := sprofile.ImportTar(path)
			if err != nil {
				panic(err)
				return
			}
		}
	},
}

package cmd

import (
	"fmt"

	"github.com/dhurley94/pritunl-client-electron/cli/errortypes"
	"github.com/dhurley94/pritunl-client-electron/cli/sprofile"
	"github.com/dropbox/godropbox/errors"
	"github.com/spf13/cobra"
)

var LogsCmd = &cobra.Command{
	Use:   "logs [profile_id]",
	Short: "Show logs for profile",
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) == 0 {
			err := errortypes.NotFoundError{
				errors.New("cmd: Missing profile ID"),
			}
			panic(err)
		}

		sprfl, err := sprofile.Match(args[0])
		if err != nil {
			panic(err)
		}

		data, err := sprfl.GetLogs()
		if err != nil {
			panic(err)
		}

		fmt.Print(data)
	},
}

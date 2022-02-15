package cmd

import (
	"fmt"

	"github.com/dhurley94/pritunl-client-electron/service/constants"
	"github.com/spf13/cobra"
)

var VersionCmd = &cobra.Command{
	Use:   "version",
	Short: "Show version",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Printf("Pritunl Client v%s\n", constants.Version)
	},
}

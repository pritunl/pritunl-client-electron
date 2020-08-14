package cmd

import (
	"os"

	"github.com/olekukonko/tablewriter"
	"github.com/pritunl/pritunl-client-electron/cli/sprofile"
	"github.com/spf13/cobra"
)

var ListCmd = &cobra.Command{
	Use:   "list",
	Short: "List profiles",
	Run: func(cmd *cobra.Command, args []string) {
		sprfls, err := sprofile.GetAll()
		if err != nil {
			return
		}

		table := tablewriter.NewWriter(os.Stdout)
		table.SetHeader([]string{
			"Name",
			"Online For",
			"Server Address",
			"Client Address",
		})
		table.SetBorder(true)

		for _, sprfl := range sprfls {
			table.Append([]string{
				sprfl.FormatedName(),
				"23 hours 12 seconds",
				"172.16.65.12",
				"10.32.174.72",
			})
		}

		table.Render()
	},
}

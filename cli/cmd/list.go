package cmd

import (
	"os"

	"github.com/dhurley94/pritunl-client-electron/cli/sprofile"
	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"
)

var ListCmd = &cobra.Command{
	Use:   "list",
	Short: "List profiles",
	Run: func(cmd *cobra.Command, args []string) {
		sprfls, err := sprofile.GetAll()
		if err != nil {
			panic(err)
			return
		}

		table := tablewriter.NewWriter(os.Stdout)
		table.SetHeader([]string{
			"ID",
			"Name",
			"Online For",
			"Server Address",
			"Client Address",
		})
		table.SetBorder(true)

		for _, sprfl := range sprfls {
			if sprfl.Profile != nil {
				table.Append([]string{
					sprfl.Id,
					sprfl.FormatedName(),
					sprfl.Profile.FormatedTime(),
					sprfl.Profile.ServerAddr,
					sprfl.Profile.ClientAddr,
				})
			} else {
				table.Append([]string{
					sprfl.Id,
					sprfl.FormatedName(),
					"Disconnected",
					"-",
					"-",
				})
			}
		}

		table.Render()
	},
}

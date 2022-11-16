package cmd

import (
	"os"

	"github.com/olekukonko/tablewriter"
	"github.com/pritunl/pritunl-client-electron/cli/service"
	"github.com/pritunl/pritunl-client-electron/cli/sprofile"
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

		var table service.Printable
		if doPlainOutput {
			table = service.NewPlainWriter(os.Stdout)
		} else {
			table = tablewriter.NewWriter(os.Stdout)
			table.SetBorder(true)
		}

		table.SetHeader([]string{
			"ID",
			"Name",
			"State",
			"Autostart",
			"Online For",
			"Server Address",
			"Client Address",
		})

		for _, sprfl := range sprfls {
			if sprfl.Profile != nil {
				table.Append([]string{
					sprfl.Id,
					sprfl.FormatedName(),
					sprfl.FormatedRunState(),
					sprfl.FormatedState(),
					sprfl.Profile.FormatedTime(),
					sprfl.Profile.ServerAddr,
					sprfl.Profile.ClientAddr,
				})
			} else {
				table.Append([]string{
					sprfl.Id,
					sprfl.FormatedName(),
					sprfl.FormatedRunState(),
					sprfl.FormatedState(),
					"Disconnected",
					"-",
					"-",
				})
			}
		}

		table.Render()
	},
}

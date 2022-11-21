package cmd

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/dropbox/godropbox/errors"
	"github.com/olekukonko/tablewriter"
	"github.com/pritunl/pritunl-client-electron/cli/errortypes"
	"github.com/pritunl/pritunl-client-electron/cli/sprofile"
	"github.com/spf13/cobra"
)

type Profile struct {
	Id            string
	Name          string
	State         string
	RunState      string
	Connected     bool
	Uptime        int64
	Status        string
	ServerAddress string
	ClientAddress string
}

var ListCmd = &cobra.Command{
	Use:   "list",
	Short: "List profiles",
	Run: func(cmd *cobra.Command, args []string) {
		sprfls, err := sprofile.GetAll()
		cobra.CheckErr(err)

		if jsonFormat || jsonFormated {
			prfls := []*Profile{}

			for _, sprfl := range sprfls {
				if sprfl.Profile != nil {
					prfls = append(prfls, &Profile{
						Id:            sprfl.Id,
						Name:          sprfl.FormatedName(),
						State:         sprfl.FormatedState(),
						RunState:      sprfl.FormatedRunState(),
						Uptime:        sprfl.Profile.Uptime(),
						Status:        sprfl.Profile.FormatedTime(),
						ServerAddress: sprfl.Profile.ServerAddr,
						ClientAddress: sprfl.Profile.ClientAddr,
					})
				} else {
					prfls = append(prfls, &Profile{
						Id:            sprfl.Id,
						Name:          sprfl.FormatedName(),
						State:         sprfl.FormatedState(),
						RunState:      sprfl.FormatedRunState(),
						Uptime:        0,
						Status:        "Disconnected",
						ServerAddress: "",
						ClientAddress: "",
					})
				}
			}

			var output []byte
			if jsonFormated {
				output, err = json.MarshalIndent(prfls, "", "  ")
				if err != nil {
					err = &errortypes.ParseError{
						errors.Wrap(err, "utils: Failed to marshal profile"),
					}
					cobra.CheckErr(err)
				}
			} else {
				output, err = json.Marshal(prfls)
				if err != nil {
					err = &errortypes.ParseError{
						errors.Wrap(err, "utils: Failed to marshal profile"),
					}
					cobra.CheckErr(err)
				}
			}

			fmt.Println(string(output))
		} else {
			table := tablewriter.NewWriter(os.Stdout)
			table.SetHeader([]string{
				"ID",
				"Name",
				"State",
				"Autostart",
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
		}
	},
}

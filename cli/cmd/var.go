package cmd

var (
	mode     string
	password string
)

func init() {
	StartCmd.Flags().StringVarP(
		&mode,
		"mode",
		"m",
		"",
		"VPN mode (ovpn, wg)",
	)
	StartCmd.Flags().StringVarP(
		&password,
		"password",
		"p",
		"",
		"VPN password",
	)
}

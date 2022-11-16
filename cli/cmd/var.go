package cmd

var (
	mode           string
	password       string
	passwordPrompt bool
	doPlainOutput  bool
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
	StartCmd.Flags().BoolVarP(
		&passwordPrompt,
		"password-read",
		"r",
		false,
		"Prompt for VPN password",
	)
	ListCmd.Flags().BoolVarP(
		&doPlainOutput,
		"plain",
		"1",
		false,
		"No fancy table formatting",
	)
}

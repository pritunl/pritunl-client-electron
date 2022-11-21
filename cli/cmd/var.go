package cmd

var (
	mode           string
	password       string
	passwordPrompt bool
	jsonFormat     bool
	jsonFormated   bool
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
		&jsonFormat,
		"json",
		"j",
		false,
		"Format output in JSON",
	)

	ListCmd.Flags().BoolVarP(
		&jsonFormated,
		"json-formatted",
		"f",
		false,
		"Format output in indented JSON",
	)
}

package colorize

type Color string

const (
	None       = ""
	Bold       = "\033[1m"
	Black      = "\033[0;30m"
	BlackBold  = "\033[1;30m"
	Red        = "\033[0;31m"
	RedBold    = "\033[1;31m"
	Green      = "\033[0;32m"
	GreenBold  = "\033[1;32m"
	Yellow     = "\033[0;33m"
	YellowBold = "\033[1;33m"
	Blue       = "\033[0;34m"
	BlueBold   = "\033[1;34m"
	Purple     = "\033[0;35m"
	PurpleBold = "\033[1;35m"
	Cyan       = "\033[0;36m"
	CyanBold   = "\033[1;36m"
	White      = "\033[0;37m"
	WhiteBold  = "\033[1;37m"
	BlackBg    = "\033[40m"
	RedBg      = "\033[41m"
	GreenBg    = "\033[42m"
	YellowBg   = "\033[43m"
	BlueBg     = "\033[44m"
	PurpleBg   = "\033[45m"
	CyanBg     = "\033[46m"
	WhiteBg    = "\033[47m"
)

func ColorString(input string, fg Color, bg Color) (str string) {
	str = string(fg) + string(bg) + input + "\033[0m"
	return
}

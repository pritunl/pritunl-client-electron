package iface

import (
	"fmt"
)

func renderCol(width int, format string, args ...interface{}) string {
	data := fmt.Sprintf(format, args...)
	if len(data) <= width {
		return data
	}
	if width < 4 {
		return data[:width]
	}
	return data[:width-3] + "..."
}

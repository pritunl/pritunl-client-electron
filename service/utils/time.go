package utils

import (
	"time"
)

func SinceSafe(t time.Time) time.Duration {
	return t.Sub(time.Now())
}

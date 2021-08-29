package utils

import (
	"time"
)

func SinceSafe(t time.Time) time.Duration {
	return t.Sub(time.Now())
}

func SinceAbs(t time.Time) (s time.Duration) {
	s = SinceSafe(t)
	if s < 0 {
		s = s * -1
	}
	return
}

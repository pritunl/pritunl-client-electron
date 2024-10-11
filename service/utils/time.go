package utils

import (
	"time"
)

func SinceSafe(t time.Time) time.Duration {
	return time.Duration(time.Now().UnixNano()-t.UnixNano()) * time.Nanosecond
}

func SinceAbs(t time.Time) (s time.Duration) {
	s = SinceSafe(t)
	if s < 0 {
		s = s * -1
	}
	return
}

func SinceFormatted(t time.Time) int {
	if t.IsZero() {
		return -1
	}
	return int(time.Since(t).Seconds())
}

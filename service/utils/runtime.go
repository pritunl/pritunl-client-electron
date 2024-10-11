package utils

import (
	"fmt"
	"runtime"
)

func GetStackTrace() string {
	var stackBuf [200]uintptr
	stackLength := runtime.Callers(2, stackBuf[:])
	stack := make([]uintptr, stackLength)
	copy(stack, stackBuf[:stackLength])

	frames := runtime.CallersFrames(stack)
	var trace string
	for {
		frame, more := frames.Next()
		trace += fmt.Sprintf("%s()\n\t%s:%d\n",
			frame.Function, frame.File, frame.Line)
		if !more {
			break
		}
	}
	return trace
}

package logger

type Writer struct {
}

func (w *Writer) Write(p []byte) (int, error) {
	return len(p), nil
}

package service

import (
	"fmt"
	"io"
	"strings"
)

const fieldSeparator = ","

type PlainTable struct {
	writer  io.Writer
	headers []string
	lines   [][]string
}

type Printable interface {
	SetHeader([]string)
	SetBorder(bool)
	Append([]string)
	Render()
}

func NewPlainWriter(writer io.Writer) *PlainTable {
	return &PlainTable{
		writer:  writer,
		headers: make([]string, 0),
		lines:   make([][]string, 0),
	}
}

func (t *PlainTable) SetHeader(keys []string) {
	t.headers = keys
}

func (t *PlainTable) SetBorder(bool) {
	// just to conform with Printable interface
}

func (t *PlainTable) Append(values []string) {
	t.lines = append(t.lines, values)
}

func (t *PlainTable) Render() {
	for _, line := range t.lines {
		fmt.Fprintln(t.writer, strings.Join(line, fieldSeparator))
	}
}

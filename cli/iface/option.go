package iface

import (
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

var (
	optionButtonStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("#FFFFFF")).
				Background(lipgloss.Color("#3B82F6")).
				Padding(0, 3).
				MarginTop(1).
				MarginRight(2)
	optionButtonActiveStyle = optionButtonStyle.
				Foreground(lipgloss.Color("#3B82F6")).
				Background(lipgloss.Color("#FFFFFF")).
				Underline(true)

	textInputStyle = lipgloss.NewStyle().
			BorderForeground(lipgloss.Color("#3B82F6")).
			BorderStyle(lipgloss.NormalBorder()).
			Padding(0, 1)
	toggleOffStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#6B7280")).
			Background(lipgloss.Color("#E5E7EB")).
			Padding(0, 1).
			MarginRight(1)

	toggleOnStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#FFFFFF")).
			Background(lipgloss.Color("#3B82F6")).
			Padding(0, 1).
			MarginRight(1)
	toggleLabelStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("#374151")).
				MarginRight(2)
)

type Option interface {
	Init()
	Interactive() bool
	Footer() bool
	Update(tea.Msg) tea.Cmd
	Focused() bool
	Focus() tea.Cmd
	Unfocus() tea.Cmd
	OnEnter() int
	OnSpace()
	View() string
}

type OptionText struct {
	Label       string
	Placeholder string
	Value       string
	model       textinput.Model
}

func (o *OptionText) Init() {
	o.model = textinput.New()
	o.model.Placeholder = o.Placeholder
	o.model.CharLimit = 100
	o.model.Width = 40
	if o.Value != "" {
		o.model.SetValue(o.Value)
	}
}

func (o *OptionText) Interactive() bool {
	return true
}

func (o *OptionText) Footer() bool {
	return false
}

func (o *OptionText) Update(msg tea.Msg) (cmd tea.Cmd) {
	o.model, cmd = o.model.Update(msg)
	return
}

func (o *OptionText) Focused() bool {
	return o.model.Focused()
}

func (o *OptionText) Focus() (cmd tea.Cmd) {
	cmd = o.model.Focus()
	return
}

func (o *OptionText) Unfocus() (cmd tea.Cmd) {
	o.model.Blur()
	return
}

func (o *OptionText) OnEnter() int {
	return -1
}

func (o *OptionText) OnSpace() {
	return
}

func (o *OptionText) View() string {
	field := o.Label + " "
	field += o.model.View()
	return field
}

func (o *OptionText) GetValue() string {
	return o.model.Value()
}

type OptionButton struct {
	Label   string
	Return  int
	focused bool
}

func (o *OptionButton) Footer() bool {
	return true
}

func (o *OptionButton) Init() {
}

func (o *OptionButton) Interactive() bool {
	return true
}

func (o *OptionButton) Update(msg tea.Msg) (cmd tea.Cmd) {
	return
}

func (o *OptionButton) Focused() bool {
	return o.focused
}

func (o *OptionButton) Focus() (cmd tea.Cmd) {
	o.focused = true
	return
}

func (o *OptionButton) Unfocus() (cmd tea.Cmd) {
	o.focused = false
	return
}

func (o *OptionButton) OnEnter() int {
	return o.Return
}

func (o *OptionButton) OnSpace() {
	return
}

func (o *OptionButton) View() string {
	if o.focused {
		return optionButtonActiveStyle.Render(o.Label)
	}
	return optionButtonStyle.Render(o.Label)
}

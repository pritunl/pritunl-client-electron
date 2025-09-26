package iface

import (
	"github.com/charmbracelet/bubbles/key"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

var (
	dialogBoxStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(lipgloss.Color("#3B82F6")).
			Padding(1, 2).
			BorderTop(true).
			BorderLeft(true).
			BorderRight(true).
			BorderBottom(true)

	dialogTitleStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("#3B82F6")).
				Bold(true).
				PaddingBottom(1)
)

type DialogKeyMap struct {
	Left     key.Binding
	Right    key.Binding
	Up       key.Binding
	Down     key.Binding
	Enter    key.Binding
	Esc      key.Binding
	Tab      key.Binding
	ShiftTab key.Binding
	Space    key.Binding
}

var dialogKeys = DialogKeyMap{
	Left: key.NewBinding(
		key.WithKeys("left", "h"),
		key.WithHelp("←/h", "left"),
	),
	Right: key.NewBinding(
		key.WithKeys("right", "l"),
		key.WithHelp("→/l", "right"),
	),
	Up: key.NewBinding(
		key.WithKeys("up", "k"),
		key.WithHelp("↑/k", "up"),
	),
	Down: key.NewBinding(
		key.WithKeys("down", "j"),
		key.WithHelp("↓/j", "down"),
	),
	Enter: key.NewBinding(
		key.WithKeys("enter"),
		key.WithHelp("enter", "select"),
	),
	Esc: key.NewBinding(
		key.WithKeys("esc"),
		key.WithHelp("esc", "close"),
	),
	Tab: key.NewBinding(
		key.WithKeys("tab"),
		key.WithHelp("tab", "next field"),
	),
	ShiftTab: key.NewBinding(
		key.WithKeys("shift+tab"),
		key.WithHelp("shift+tab", "previous field"),
	),
	Space: key.NewBinding(
		key.WithKeys("space"),
		key.WithHelp("space", "toggle"),
	),
}

type Dialog struct {
	title   string
	message string
	width   int
	height  int
	options []Option
}

type DialogResult struct {
	Return int
}

func NewDialog(title, message string, opts ...Option) Dialog {
	for _, opt := range opts {
		opt.Init()
	}

	return Dialog{
		title:   title,
		message: message,
		width:   60,
		height:  30,
		options: opts,
	}
}

func (d *Dialog) GetActiveOption() Option {
	for _, opt := range d.options {
		if opt.Interactive() && opt.Focused() {
			return opt
		}
	}

	for _, opt := range d.options {
		if opt.Interactive() {
			return opt
		}
	}

	return nil
}

func (d *Dialog) SetSize(width, height int) {
	d.width = width
	d.height = height
}

func (d Dialog) View() string {
	title := dialogTitleStyle.Render(d.title)

	fields := []string{
		title,
		d.message,
		"",
	}
	footerFields := []string{}

	for _, opt := range d.options {
		if opt.Footer() {
			footerFields = append(footerFields, opt.View())
		} else {
			fields = append(fields, opt.View(), "")
		}
	}

	fields = append(fields, lipgloss.JoinHorizontal(
		lipgloss.Top, footerFields...))

	content := lipgloss.JoinVertical(
		lipgloss.Left,
		fields...,
	)

	return dialogBoxStyle.Width(d.width).Render(content)
}

func (d Dialog) Update(msg tea.Msg) (Dialog, tea.Cmd) {
	var cmd tea.Cmd

	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch {
		case key.Matches(msg, key.NewBinding(
			key.WithKeys("q", "ctrl+c"),
			key.WithHelp("q", "quit"),
		)):
			return d, tea.Quit
		case key.Matches(msg, dialogKeys.Tab),
			key.Matches(msg, dialogKeys.Down):

			focusNext := false
			hasFocus := false

			for _, opt := range d.options {
				if !opt.Interactive() || opt.Footer() {
					continue
				}

				if focusNext {
					opt.Focus()
					focusNext = false
					hasFocus = true
					continue
				}

				if opt.Focused() {
					opt.Unfocus()
					focusNext = true
				}
			}

			for _, opt := range d.options {
				if !opt.Interactive() || !opt.Footer() {
					continue
				}

				if focusNext {
					opt.Focus()
					focusNext = false
					hasFocus = true
					continue
				}

				if opt.Focused() {
					opt.Unfocus()
					focusNext = true
				}
			}

			if !hasFocus {
				for _, opt := range d.options {
					if opt.Interactive() || opt.Footer() {
						opt.Focus()
						hasFocus = true
						break
					}
				}

				if !hasFocus {
					for _, opt := range d.options {
						if opt.Interactive() || !opt.Footer() {
							opt.Focus()
							break
						}
					}
				}
			}
		case key.Matches(msg, dialogKeys.Up):
			focusNext := false
			hasFocus := false

			for i := len(d.options) - 1; i >= 0; i-- {
				opt := d.options[i]
				if !opt.Interactive() || !opt.Footer() {
					continue
				}

				if focusNext {
					opt.Focus()
					focusNext = false
					hasFocus = true
					continue
				}

				if opt.Focused() {
					opt.Unfocus()
					focusNext = true
				}
			}

			for i := len(d.options) - 1; i >= 0; i-- {
				opt := d.options[i]
				if !opt.Interactive() || opt.Footer() {
					continue
				}

				if focusNext {
					opt.Focus()
					focusNext = false
					hasFocus = true
					continue
				}

				if opt.Focused() {
					opt.Unfocus()
					focusNext = true
				}
			}

			if !hasFocus {
				for i := len(d.options) - 1; i >= 0; i-- {
					opt := d.options[i]
					if opt.Interactive() || !opt.Footer() {
						opt.Focus()
						break
					}
				}

				if !hasFocus {
					for i := len(d.options) - 1; i >= 0; i-- {
						opt := d.options[i]
						if opt.Interactive() || opt.Footer() {
							opt.Focus()
							hasFocus = true
							break
						}
					}
				}
			}
		case key.Matches(msg, dialogKeys.Space):
			d.GetActiveOption().OnSpace()
		case key.Matches(msg, dialogKeys.Left):
			activeOpt := d.GetActiveOption()
			if activeOpt != nil && activeOpt.Footer() {
				focusNext := false
				for _, opt := range d.options {
					if !opt.Interactive() || !opt.Footer() {
						continue
					}

					if focusNext {
						opt.Focus()
						focusNext = false
						continue
					}

					if opt.Focused() {
						opt.Unfocus()
						focusNext = true
					}
				}
			}
		case key.Matches(msg, dialogKeys.Right):
			activeOpt := d.GetActiveOption()
			if activeOpt != nil && activeOpt.Footer() {
				focusNext := false
				for i := len(d.options) - 1; i >= 0; i-- {
					opt := d.options[i]

					if !opt.Interactive() || !opt.Footer() {
						continue
					}

					if focusNext {
						opt.Focus()
						focusNext = false
						continue
					}

					if opt.Focused() {
						opt.Unfocus()
						focusNext = true
					}
				}
			}
		case key.Matches(msg, dialogKeys.Enter):
			activeOpt := d.GetActiveOption()
			if activeOpt != nil {
				choice := activeOpt.OnEnter()
				if choice != -1 {
					return d, func() tea.Msg {
						return DialogCloseMsg{
							Return: choice,
						}
					}
				}
			}
		case key.Matches(msg, dialogKeys.Esc):
			return d, func() tea.Msg {
				return DialogCloseMsg{
					Return: -1,
				}
			}
		}
	}

	for _, opt := range d.options {
		if opt.Focused() {
			cmd = opt.Update(msg)
			return d, cmd
		}
	}

	return d, nil
}

type DialogCloseMsg struct {
	Return      int
	TextValue   string
	ToggleValue bool
}

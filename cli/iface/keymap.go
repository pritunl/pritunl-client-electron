package iface

import (
	"github.com/charmbracelet/bubbles/key"
)

type KeyMap struct {
	Up         key.Binding
	Down       key.Binding
	Connect    key.Binding
	ConnectWg  key.Binding
	Disconnect key.Binding
	Import     key.Binding
	Logs       key.Binding
	Settings   key.Binding
	Quit       key.Binding
}

var bindings = KeyMap{
	Up: key.NewBinding(
		key.WithKeys("up", "k"),
		key.WithHelp("↑/k", "up"),
	),
	Down: key.NewBinding(
		key.WithKeys("down", "j"),
		key.WithHelp("↓/j", "down"),
	),
	Import: key.NewBinding(
		key.WithKeys("i"),
		key.WithHelp("i", "import"),
	),
	Connect: key.NewBinding(
		key.WithKeys("c"),
		key.WithHelp("c", "connect_ovpn"),
	),
	ConnectWg: key.NewBinding(
		key.WithKeys("w"),
		key.WithHelp("w", "connect_wg"),
	),
	Disconnect: key.NewBinding(
		key.WithKeys("d"),
		key.WithHelp("d", "disconnect"),
	),
	Logs: key.NewBinding(
		key.WithKeys("l"),
		key.WithHelp("l", "logs"),
	),
	Settings: key.NewBinding(
		key.WithKeys("s"),
		key.WithHelp("s", "settings"),
	),
	Quit: key.NewBinding(
		key.WithKeys("q", "ctrl+c"),
		key.WithHelp("q", "quit"),
	),
}

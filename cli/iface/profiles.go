package iface

import (
	"fmt"
	"io"
	"strings"

	"github.com/charmbracelet/bubbles/list"
	"github.com/charmbracelet/lipgloss"
)

type Profile struct {
	Id              string `json:"id"`
	Name            string `json:"name"`
	User            string `json:"user"`
	Organization    string `json:"organization"`
	Server          string `json:"server"`
	Wg              bool   `json:"wg"`
	Active          bool   `json:"active"`
	State           string `json:"state"`
	RunState        string `json:"run_state"`
	RegistrationKey string `json:"registration_key"`
	Connected       bool   `json:"connected"`
	Uptime          int64  `json:"uptime"`
	StatusLabel     string `json:"status_label"`
	Status          string `json:"status"`
	ServerAddress   string `json:"server_address"`
	ClientAddress   string `json:"client_address"`
}

var (
	itemStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(lipgloss.Color("#361da3")).
			Padding(0, 1)

	itemSelectedStyle = lipgloss.NewStyle().
				Border(lipgloss.RoundedBorder()).
				BorderForeground(lipgloss.Color("#a1cdff")).
				Padding(0, 1)
	itemColStyle = lipgloss.NewStyle().
			Align(lipgloss.Left)
	itemTitleStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#4a8cf7")).
			Bold(true)
	greenStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#10B981"))
	redStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#EF4444"))
	yellowSytle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#fffb00"))
)

type ListItem struct {
	profile Profile
}

func (i ListItem) Profile() Profile {
	return i.profile
}

func (i ListItem) FilterValue() string {
	return i.profile.Name
}

func (i ListItem) Title() string {
	return itemTitleStyle.Render(i.profile.Name)
}

func (i ListItem) Body(width int) string {
	rows := []string{}

	colWidth := width - 5
	style := itemColStyle.Width(colWidth)

	row := style.Render(renderCol(colWidth, "User: %s", i.profile.User))
	rows = append(rows, row)

	var statusStyle lipgloss.Style
	if i.profile.Active {
		statusStyle = statusConnectedStyle
	} else {
		statusStyle = statusDisconnectedStyle
	}

	row = style.Render(fmt.Sprintf(
		"%s: %s",
		i.profile.StatusLabel,
		statusStyle.Render(renderCol(colWidth-12, i.profile.Status)),
	))

	rows = append(rows, row)

	row = style.Render(renderCol(colWidth, "Server: %s",
		i.profile.ServerAddress))
	rows = append(rows, row)
	row = renderCol(colWidth, "Organization: %s", i.profile.Organization)
	rows = append(rows, row)

	serverAddr := i.profile.ServerAddress
	if serverAddr == "" {
		serverAddr = "-"
	}
	clientAddr := i.profile.ClientAddress
	if clientAddr == "" {
		clientAddr = "-"
	}

	row = style.Render(renderCol(
		colWidth,
		"Server Address: %s",
		serverAddr,
	))
	rows = append(rows, row)
	row = style.Render(renderCol(
		colWidth,
		"Client Address: %s",
		clientAddr,
	))
	rows = append(rows, row)

	return strings.Join(rows, "\n")
}

func (i ListItem) BodySplit(width int) string {
	rows := []string{}

	colWidth := min((width-5)/2, 60)
	style := itemColStyle.Width(colWidth)

	left := style.Render(renderCol(colWidth, "User: %s", i.profile.User))

	var statusStyle lipgloss.Style
	if i.profile.Active {
		statusStyle = statusConnectedStyle
	} else {
		statusStyle = statusDisconnectedStyle
	}

	right := style.Render(fmt.Sprintf(
		"%s: %s",
		i.profile.StatusLabel,
		statusStyle.Render(
			renderCol(colWidth-12, i.profile.Status)),
	))

	rows = append(rows, lipgloss.JoinHorizontal(lipgloss.Left, left, right))

	left = style.Render(renderCol(colWidth, "Server: %s", i.profile.Server))
	right = renderCol(colWidth, "Organization: %s", i.profile.Organization)
	rows = append(rows, lipgloss.JoinHorizontal(lipgloss.Left, left, right))

	serverAddr := i.profile.ServerAddress
	if serverAddr == "" {
		serverAddr = "-"
	}
	clientAddr := i.profile.ClientAddress
	if clientAddr == "" {
		clientAddr = "-"
	}

	left = style.Render(renderCol(
		colWidth,
		"Server Address: %s",
		serverAddr,
	))
	right = style.Render(renderCol(
		colWidth,
		"Client Address: %s",
		clientAddr,
	))
	rows = append(rows, lipgloss.JoinHorizontal(
		lipgloss.Left, left, right))

	return strings.Join(rows, "\n")
}

type ListDelegate struct {
	list.DefaultDelegate
	width int
	split bool
}

func (d *ListDelegate) SetWidth(w int) {
	d.width = w
}

func (d ListDelegate) Height() int {
	if d.split {
		return 6
	}
	return 9
}

func (d *ListDelegate) SetSplit(x bool) {
	d.split = x
}

func (d ListDelegate) Render(w io.Writer, model list.Model,
	index int, item list.Item) {

	listItem, ok := item.(ListItem)
	if !ok {
		return
	}

	var style lipgloss.Style
	if index == model.Index() {
		style = itemSelectedStyle
	} else {
		style = itemStyle
	}

	var body string
	if d.split {
		body = listItem.BodySplit(d.width)
	} else {
		body = listItem.Body(d.width)
	}

	content := lipgloss.JoinVertical(
		lipgloss.Left,
		listItem.Title(),
		body,
	)

	fmt.Fprint(w, style.Render(content))
}

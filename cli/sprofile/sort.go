package sprofile

import (
	"sort"
	"strings"
)

type Sprofiles []*Sprofile

func (s Sprofiles) Len() int {
	return len(s)
}

func (s Sprofiles) Swap(i, j int) {
	s[i], s[j] = s[j], s[i]
}

func (s Sprofiles) Less(i, j int) bool {
	return strings.ToLower(
		s[i].FormatedName()) < strings.ToLower(s[j].FormatedName())
}

func (s Sprofiles) Sort() {
	sort.Sort(s)
}

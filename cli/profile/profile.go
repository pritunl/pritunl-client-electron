package profile

type Route struct {
	NextHop    string `json:"next_hop"`
	Network    string `json:"network"`
	Metric     int    `json:"metric"`
	NetGateway bool   `json:"net_gateway"`
}

type Profile struct {
	Id           string   `json:"id"`
	Mode         string   `json:"mode"`
	Iface        string   `json:"iface"`
	Tuniface     string   `json:"tun_iface"`
	Routes       []*Route `json:"routes'"`
	Routes6      []*Route `json:"routes6'"`
	Reconnect    bool     `json:"reconnect"`
	Status       string   `json:"status"`
	Timestamp    int64    `json:"timestamp"`
	GatewayAddr  string   `json:"gateway_addr"`
	GatewayAddr6 string   `json:"gateway_addr6"`
	ServerAddr   string   `json:"server_addr"`
	ClientAddr   string   `json:"client_addr"`
	MacAddr      string   `json:"mac_addr"`
	MacAddrs     []string `json:"mac_addrs"`
}

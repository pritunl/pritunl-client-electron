# pritunl-client-electron: pritunl vpn client

[![package-macOS](https://img.shields.io/badge/package-macOS-cfcfcf.svg?style=flat)](https://github.com/pritunl/pritunl-client-electron/releases)
[![package-windows](https://img.shields.io/badge/package-windows-00adef.svg?style=flat)](https://github.com/pritunl/pritunl-client-electron/releases)
[![github](https://img.shields.io/badge/github-pritunl-11bdc2.svg?style=flat)](https://github.com/pritunl)
[![twitter](https://img.shields.io/badge/twitter-pritunl-55acee.svg?style=flat)](https://twitter.com/pritunl)
[![medium](https://img.shields.io/badge/medium-pritunl-b32b2b.svg?style=flat)](https://pritunl.medium.com)
[![forum](https://img.shields.io/badge/discussion-forum-ffffff.svg?style=flat)](https://forum.pritunl.com)

[Pritunl-client-electron](https://github.com/pritunl/pritunl-client-electron)
is an open source openvpn client. Documentation and more information can be
found at the home page [client.pritunl.com](https://client.pritunl.com)

## Install From Source (macOS)

If the Pritunl package is currently installed run the uninstall command
below. Requires homebrew with git, go and node.

```bash
brew install git go node
bash <(curl -s https://raw.githubusercontent.com/pritunl/pritunl-client-electron/master/tools/install_macos.sh)
```

## Uninstall From Source (macOS)

```bash
bash <(curl -s https://raw.githubusercontent.com/pritunl/pritunl-client-electron/master/tools/uninstall_macos.sh)
```

## Install Linux Client on ARM

```bash
sudo dnf -y install git-core wireguard-tools openvpn

sudo rm -rf /usr/local/go
wget https://go.dev/dl/go1.24.3.linux-arm64.tar.gz
echo "a463cb59382bd7ae7d8f4c68846e73c4d589f223c589ac76871b66811ded7836 go1.24.3.linux-arm64.tar.gz" | sha256sum -c -

sudo tar -C /usr/local -xf go1.24.3.linux-arm64.tar.gz
rm -f go1.24.3.linux-arm64.tar.gz

tee -a ~/.bashrc << EOF
export GOPATH=\$HOME/go
export GOROOT=/usr/local/go
export PATH=/usr/local/go/bin:\$PATH
EOF
source ~/.bashrc

go install github.com/pritunl/pritunl-client-electron/service@latest
go install github.com/pritunl/pritunl-client-electron/cli@latest
sudo cp ~/go/bin/service /usr/bin/pritunl-client-service
sudo cp ~/go/bin/cli /usr/bin/pritunl-client

sudo cp "$(ls -td ~/go/pkg/mod/github.com/pritunl/pritunl-client-electron@*/ | head -n1)/resources_linux/pritunl-client.service" /etc/systemd/system/pritunl-client.service
sudo systemctl daemon-reload
sudo systemctl enable --now pritunl-client.service

sudo pritunl-client add <profile_uri>
sudo pritunl-client list
```

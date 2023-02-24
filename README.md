# pritunl-client-electron: pritun vpn client

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

## Installing Specific Version

Download the source file form https://github.com/pritunl/pritunl-client-electron/releases
eg: If I want Pritunl for Pritunl Client v1.3.3343.50 version
then, 
```wget https://github.com/pritunl/pritunl-client-electron/archive/refs/tags/1.3.3343.50.tar.gz
tar -xvzf 1.3.3343.50.tar.gz
brew install git go node
bash install_macos.sh
```

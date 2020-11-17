#!/bin/bash
set -e

brew uninstall --force openvpn
brew uninstall --force pkcs11-helper
brew uninstall --force --ignore-dependencies openssl@1.1
brew uninstall --force lz4
brew uninstall --force lzo
brew uninstall --force makedepend
brew uninstall --force pkg-config
brew uninstall --force automake
brew uninstall --force autoconf
brew uninstall --force libtool

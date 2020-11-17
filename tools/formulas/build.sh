#!/bin/bash
set -e

brew install --build-from-source --verbose libtool.rb
brew install --build-from-source --verbose autoconf.rb
brew install --build-from-source --verbose automake.rb
brew install --build-from-source --verbose pkg-config.rb
brew install --build-from-source --verbose makedepend.rb
brew install --build-from-source --verbose lzo.rb
brew install --build-from-source --verbose lz4.rb
brew install --build-from-source --verbose openssl@1.1.rb
brew install --build-from-source --verbose pkcs11-helper.rb
brew install --build-from-source --verbose openvpn.rb

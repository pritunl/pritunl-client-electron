#!/bin/bash
set -e

brew install --build-from-source libtool.rb
brew install --build-from-source autoconf.rb
brew install --build-from-source automake.rb
brew install --build-from-source pkg-config.rb
brew install --build-from-source makedepend.rb
brew install --build-from-source lzo.rb
brew install --build-from-source lz4.rb
brew install --build-from-source openssl.rb
brew install --build-from-source pkcs11-helper.rb
brew install --build-from-source openvpn.rb

#!/bin/bash
set -e

export CFLAGS="-mmacosx-version-min=11.0"
export CXXFLAGS="-mmacosx-version-min=11.0"
export CPPFLAGS="-mmacosx-version-min=11.0"
export LINKFLAGS="-mmacosx-version-min=11.0"
export OPENSSL_CFLAGS="-I/Users/apple/build/openssl/include"
export OPENSSL_LIBS="-L/Users/apple/build/openssl/lib -lssl -lcrypto -lz"

#autoreconf --verbose --install --force
./configure \
  --disable-debug \
  --disable-dependency-tracking \
  --disable-threading \
  --disable-slotevent \
  --disable-crypto-engine-gnutls \
  --disable-crypto-engine-nss \
  --disable-crypto-engine-mbedtls \
  --disable-shared \
  --enable-static \
  --prefix=/Users/apple/build/pkcs11-helper
make install

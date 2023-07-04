#!/bin/bash
set -e

export CFLAGS="-mmacosx-version-min=11.0"
export CXXFLAGS="-mmacosx-version-min=11.0"
export CPPFLAGS="-mmacosx-version-min=11.0"
export LINKFLAGS="-mmacosx-version-min=11.0"

unset OPENSSL_LOCAL_CONFIG_DIR

perl ./Configure \
  darwin64-x86_64-cc \
  enable-ec_nistp_64_gcc_128 \
  zlib \
  no-asm \
  no-shared \
  --openssldir=etc/"openssl@1.1" \
  --prefix=/Users/apple/build/openssl
make
make test
make install

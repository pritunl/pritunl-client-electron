#!/bin/bash
set -e

export CFLAGS="-mmacosx-version-min=11.0"
export CXXFLAGS="-mmacosx-version-min=11.0"
export CPPFLAGS="-mmacosx-version-min=11.0"
export LINKFLAGS="-mmacosx-version-min=11.0"

./configure \
  --disable-dependency-tracking \
  --enable-static \
  --disable-shared \
  --prefix=/Users/apple/build/lzo
make
make check
make install

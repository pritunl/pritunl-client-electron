#!/bin/bash
set -e

export CFLAGS="-mmacosx-version-min=11.0"
export CXXFLAGS="-mmacosx-version-min=11.0"
export CPPFLAGS="-mmacosx-version-min=11.0"
export LINKFLAGS="-mmacosx-version-min=11.0"

./bootstrap.sh
./configure \
  --disable-profiling \
  --enable-static \
  --disable-shared \
  --prefix=/Users/apple/build/iperf3
make install

cp ../10-main.conf ./Configurations/10-main.conf

export CFLAGS="-mmacosx-version-min=11.0"
export CXXFLAGS="-mmacosx-version-min=11.0"
export CPPFLAGS="-mmacosx-version-min=11.0"
export LINKFLAGS="-mmacosx-version-min=11.0"

unset OPENSSL_LOCAL_CONFIG_DIR

perl ./Configure \
  darwin64-arm64-cc \
  enable-ec_nistp_64_gcc_128 \
  zlib \
  no-asm \
  no-shared \
  --openssldir=etc/"openssl@1.1" \
  --prefix=/Users/apple/build/openssl
make
make test
make install

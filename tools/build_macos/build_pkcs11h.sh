export CFLAGS="-mmacosx-version-min=11.0"
export CXXFLAGS="-mmacosx-version-min=11.0"
export CPPFLAGS="-mmacosx-version-min=11.0"
export LINKFLAGS="-mmacosx-version-min=11.0"
export OPENSSL_CFLAGS="-I`pwd`/../openssl/include"
export OPENSSL_LIBS="-L`pwd`/../openssl/lib -lssl -lcrypto -lz"

make clean
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
  --prefix=`pwd`/../pkcs11-helper
make install

make clean
CFLAGS="-mmacosx-version-min=10.6 -D __APPLE_USE_RFC_3542" \
  CXXFLAGS="-mmacosx-version-min=10.6 -D __APPLE_USE_RFC_3542" \
  CPPFLAGS="-mmacosx-version-min=10.6 -D __APPLE_USE_RFC_3542" \
  LINKFLAGS="-mmacosx-version-min=10.6 -D __APPLE_USE_RFC_3542" \
  OPENSSL_CFLAGS="-I/usr/local/opt/openssl/include" \
  OPENSSL_LIBS="-L/usr/local/opt/openssl/lib -lssl -lcrypto -lz" \
  ./configure \
    --prefix=`pwd`/../pkcs11-helper \
    --enable-static \
    --disable-shared \
    --disable-slotevent \
    --disable-threading \
    --disable-crypto-engine-gnutls \
    --disable-crypto-engine-nss \
    --disable-crypto-engine-mbedtls \
    --disable-dependency-tracking
make install

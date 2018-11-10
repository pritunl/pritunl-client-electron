make clean
CFLAGS=" -arch x86_64" \
  OPENSSL_CFLAGS="-I/usr/local/opt/openssl/include" \
  OPENSSL_LIBS="-L/usr/local/opt/openssl/lib -lssl -lcrypto -lz" \
  ./configure --build=x86_64-apple-darwin \
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

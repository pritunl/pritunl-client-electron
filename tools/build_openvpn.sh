make clean
OPENSSL_CFLAGS="-I/usr/local/opt/openssl/include" \
  OPENSSL_SSL_CFLAGS="-I/usr/local/opt/openssl/include" \
  OPENSSL_CRYPTO_CFLAGS="-I/usr/local/opt/openssl/include" \
  OPENSSL_LIBS="/usr/local/opt/openssl/lib/libssl.a -lz /usr/local/opt/openssl/lib/libcrypto.a -lz" \
  OPENSSL_SSL_LIBS="/usr/local/opt/openssl/lib/libssl.a" \
  OPENSSL_CRYPTO_LIBS="/usr/local/opt/openssl/lib/libcrypto.a -lz" \
  PKCS11_HELPER_CFLAGS="-I`pwd`/../pkcs11-helper/include" \
  PKCS11_HELPER_LIBS="-L`pwd`/../pkcs11-helper/lib -lpkcs11-helper" \
  LZO_CFLAGS="-I/usr/local/opt/lzo/include" \
  LZO_LIBS="/usr/local/opt/lzo/lib/liblzo2.a" \
  OPTIONAL_LZO_LIBS="/usr/local/opt/lzo/lib/liblzo2.a" \
  LZ4_CFLAGS="-I/usr/local/opt/lz4/include" \
  LZ4_LIBS="/usr/local/opt/lz4/lib/liblz4.a" \
  ./configure \
    --disable-debug \
    --disable-silent-rules \
    --disable-server \
    --disable-management \
    --disable-plugins \
    --disable-plugin-auth-pam \
    --disable-plugin-down-root \
    --enable-pkcs11 \
    --enable-static \
    --disable-shared
make DESTDIR="`pwd`/../ovpn/" install

./configure --enable-password-save --disable-debug --disable-silent-rules --disable-server --disable-management --disable-plugins --disable-plugin-auth-pam --disable-plugin-down-root
sed -i '' 's|CPPFLAGS = |CPPFLAGS = -I/usr/local/opt/openssl/include |g' src/openvpn/Makefile
sed -i '' 's|OPENSSL_CRYPTO_LIBS = -lcrypto|OPENSSL_CRYPTO_LIBS = -static /usr/local/opt/openssl/lib/libcrypto.a|g' src/openvpn/Makefile
sed -i '' 's|OPENSSL_SSL_LIBS = -lssl|OPENSSL_SSL_LIBS = -static /usr/local/opt/openssl/lib/libssl.a|g' src/openvpn/Makefile
sed -i '' 's|OPTIONAL_CRYPTO_LIBS =  -lssl -lcrypto|OPTIONAL_CRYPTO_LIBS = -static /usr/local/opt/openssl/lib/libssl.a -static /usr/local/opt/openssl/lib/libcrypto.a|g' src/openvpn/Makefile
sed -i '' 's|LZO_LIBS = -llzo2|LZO_LIBS = -static /usr/local/lib/liblzo2.a|g' src/openvpn/Makefile
make LZO_LIBS=-lliblzo2.2.dylib DESTDIR="`pwd`/root/" install

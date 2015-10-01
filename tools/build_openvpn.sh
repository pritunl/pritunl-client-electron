./configure --enable-password-save --disable-debug --disable-silent-rules --disable-server --disable-management --disable-plugins --disable-plugin-auth-pam --disable-plugin-down-root
sed -i '' 's|LZO_LIBS = -llzo2|LZO_LIBS = -static /usr/local/lib/liblzo2.a|g' src/openvpn/Makefile
make LZO_LIBS=-lliblzo2.2.dylib DESTDIR="`pwd`/root/" install

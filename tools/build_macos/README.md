mkdir -p /Users/apple/build
cp ./* /Users/apple/build/
cp ../../openvpn_macos/* /Users/apple/build/
cd /Users/apple/build

tar xf autoconf-2.69.tar.gz
cd ./autoconf-2.69
sh ../build_autoconf.sh
cd ../

tar xf automake-1.16.2.tar.xz
cd ./automake-1.16.2
sh ../build_automake.sh
cd ../

tar xf libtool-2.4.6.tar.xz
cd ./libtool-2.4.6
sh ../build_libtool.sh
cd ../



tar xf lz4-1.9.3.tar.gz
cd ./lz4-1.9.3
sh ../build_lz4.sh
cd ../

tar xf lzo-2.10.tar.gz
cd ./lzo-2.10
sh ../build_lzo.sh
cd ../

tar xf openssl-1.1.1h.tar.gz
cd ./openssl-1.1.1h
sh ../build_openssl.sh
cd ../

tar xf pkcs11-helper-1.26.0.tar.bz2
cd ./pkcs11-helper-1.26.0
sh ../build_pkcs11h.sh
cd ../

tar xf openvpn-2.5.0.tar.gz
cd ./openvpn-2.5.0
sh ../build_openvpn.sh
cd ../


codesign --force --timestamp --options=runtime -s "Developer ID Application: Pritunl, Inc. (U22BLATN63)" ./openvpn/sbin/openvpn

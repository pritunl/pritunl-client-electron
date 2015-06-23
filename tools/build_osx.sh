cd "$( dirname "${BASH_SOURCE[0]}" )"
cd ../

rm -rf build/osx

# Pritunl
mkdir -p build/osx/Applications
cd client
./node_modules/.bin/electron-packager ./ Pritunl --sign="Developer ID Application: Zachary Huff (73CNTLZRFJ)" --platform=darwin --arch=x64 --version=0.27.3 --icon=./www/img/pritunl.icns --out=../build/osx/Applications
cd ../

# Service
cd service
go build -a
cd ..
mkdir -p build/osx/usr/local/bin
cp service/service build/osx/usr/local/bin/pritunl-service
codesign -s "Developer ID Application: Zachary Huff (73CNTLZRFJ)" build/osx/usr/local/bin/pritunl-service

# Service Daemon
mkdir -p build/osx/Library/LaunchDaemons
cp service_osx/com.pritunl.service.plist build/osx/Library/LaunchDaemons

# Tuntap
mkdir -p build/osx/Library/Extensions
cp -pR tuntap_osx/tap.kext build/osx/Library/Extensions/
cp -pR tuntap_osx/tun.kext build/osx/Library/Extensions/
mkdir -p build/osx/Library/LaunchDaemons
cp tuntap_osx/net.sf.tuntaposx.tap.plist build/osx/Library/LaunchDaemons/
cp tuntap_osx/net.sf.tuntaposx.tun.plist build/osx/Library/LaunchDaemons/

# Openvpn
mkdir -p build/osx/usr/local/bin
cp openvpn_osx/openvpn build/osx/usr/local/bin/pritunl-openvpn
codesign -s "Developer ID Application: Zachary Huff (73CNTLZRFJ)" build/osx/usr/local/bin/pritunl-openvpn

# Package
chmod +x resources_osx/scripts/postinstall
chmod +x resources_osx/scripts/preinstall
cd build
pkgbuild --root osx --scripts ../resources_osx/scripts --sign "Developer ID Installer: Zachary Huff (73CNTLZRFJ)" --identifier com.pritunl.pkg.Pritunl --version 0.1.0 --ownership recommended --install-location / Build.pkg
productbuild --distribution ../resources_osx/distribution.xml --sign "Developer ID Installer: Zachary Huff (73CNTLZRFJ)" --version 0.1.0 Pritunl.pkg

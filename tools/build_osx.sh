#!/bin/bash
cd "$( dirname "${BASH_SOURCE[0]}" )"
cd ../

export APP_VER="$(cat client/package.json | grep version | cut -d '"' -f 4)"

rm -rf build/osx
rm -f build/Pritunl.pkg
rm -f build/Pritunl.pkg.zip

npm cache clean

git pull

# Pritunl
mkdir -p build/osx/Applications
cd client
npm install
npm update
./node_modules/.bin/electron-rebuild
export ELECTRON_VER="$(npm ls | grep electron-prebuilt | tr '@' '\n' | tail -n1)"
./node_modules/.bin/electron-packager ./ Pritunl --platform=darwin --arch=x64 --version=$ELECTRON_VER --icon=./www/img/pritunl.icns --out=../build/osx/Applications
cd ../
mv build/osx/Applications/Pritunl-darwin-x64/Pritunl.app build/osx/Applications/
rm -rf build/osx/Applications/Pritunl-darwin-x64
sleep 3
codesign --force --deep --sign "Developer ID Application: Zachary Huff (73CNTLZRFJ)" build/osx/Applications/Pritunl.app

# Service
cd service
go get -u -f
go build -v
cd ..
cp service/service build/osx/Applications/Pritunl.app/Contents/Resources/pritunl-service
codesign -s "Developer ID Application: Zachary Huff (73CNTLZRFJ)" build/osx/Applications/Pritunl.app/Contents/Resources/pritunl-service

# Service Daemon
mkdir -p build/osx/Library/LaunchDaemons
cp service_osx/com.pritunl.service.plist build/osx/Library/LaunchDaemons

# Client Agent
mkdir -p build/osx/Library/LaunchAgents
cp service_osx/com.pritunl.client.plist build/osx/Library/LaunchAgents

# Openvpn
cp openvpn_osx/openvpn build/osx/Applications/Pritunl.app/Contents/Resources/pritunl-openvpn
codesign -s "Developer ID Application: Zachary Huff (73CNTLZRFJ)" build/osx/Applications/Pritunl.app/Contents/Resources/pritunl-openvpn

# Files
touch build/osx/Applications/Pritunl.app/Contents/Resources/auth
touch build/osx/Applications/Pritunl.app/Contents/Resources/pritunl.log
touch build/osx/Applications/Pritunl.app/Contents/Resources/pritunl.log.1

# Package
chmod +x resources_osx/scripts/postinstall
chmod +x resources_osx/scripts/preinstall
cd build
pkgbuild --root osx --scripts ../resources_osx/scripts --sign "Developer ID Installer: Zachary Huff (73CNTLZRFJ)" --identifier com.pritunl.pkg.Pritunl --version $APP_VER --ownership recommended --install-location / Build.pkg
productbuild --resources ../resources_osx --distribution ../resources_osx/distribution.xml --sign "Developer ID Installer: Zachary Huff (73CNTLZRFJ)" --version $APP_VER Pritunl.pkg
zip Pritunl.pkg.zip Pritunl.pkg
rm -f Build.pkg

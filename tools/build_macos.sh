#!/bin/bash
set -e

cd "$( dirname "${BASH_SOURCE[0]}" )"
cd ../

rm -rf build

node -e "fs=require('fs');f='client/package.json';c=fs.readFileSync(f,'utf8');fs.writeFileSync(f,c.replace(/,\s*\"scripts\": \{[^}]*\}/,''))"

export APP_VER="$(cat client/package.json | grep version | cut -d '"' -f 4)"

# Service
cd service
go get
GOOS=darwin GOARCH=amd64 go build -v -o service_x86_64
GOOS=darwin GOARCH=arm64 go build -v -o service_arm64
lipo -create -output service service_x86_64 service_arm64
rm -rf service_x86_64
rm -rf service_arm64
cd ..
mkdir -p build/resources
cp service/service build/resources/pritunl-service
codesign --force --timestamp --options=runtime -s "Developer ID Application: Pritunl, Inc. (U22BLATN63)" build/resources/pritunl-service

# Device Auth
cd service_macos
rm -f "Pritunl Device Authentication"
swiftc -sdk $(xcrun --show-sdk-path --sdk macosx) -target arm64-apple-macos11 -framework CryptoKit -framework LocalAuthentication -framework Security -framework Foundation device_auth.swift -o "Pritunl Device Authentication_arm64"
swiftc -sdk $(xcrun --show-sdk-path --sdk macosx) -target x86_64-apple-macos11 -framework CryptoKit -framework LocalAuthentication -framework Security -framework Foundation device_auth.swift -o "Pritunl Device Authentication_x86_64"
lipo -create -output "Pritunl Device Authentication" "Pritunl Device Authentication_arm64" "Pritunl Device Authentication_x86_64"
rm -rf Pritunl\ Device\ Authentication_arm64
rm -rf Pritunl\ Device\ Authentication_x86_64
cp "Pritunl Device Authentication" "../build/resources/Pritunl Device Authentication"
codesign --force --timestamp --options=runtime -s "Developer ID Application: Pritunl, Inc. (U22BLATN63)" "Pritunl Device Authentication"
cd ..

# CLI
cd cli
go get
GOOS=darwin GOARCH=amd64 go build -v -o cli_x86_64
GOOS=darwin GOARCH=arm64 go build -v -o cli_arm64
lipo -create -output cli cli_x86_64 cli_arm64
rm -rf cli_x86_64
rm -rf cli_arm64
cd ..
mkdir -p build/resources
cp cli/cli build/resources/pritunl-client
codesign --force --timestamp --options=runtime -s "Developer ID Application: Pritunl, Inc. (U22BLATN63)" build/resources/pritunl-client

# Openvpn
cp openvpn_macos/openvpn10 build/resources/pritunl-openvpn10
codesign --force --timestamp --options=runtime -s "Developer ID Application: Pritunl, Inc. (U22BLATN63)" build/resources/pritunl-openvpn10
lipo -create -output openvpn_macos/openvpn_universal openvpn_macos/openvpn openvpn_macos/openvpn_arm64
cp openvpn_macos/openvpn_universal build/resources/pritunl-openvpn
codesign --force --timestamp --options=runtime -s "Developer ID Application: Pritunl, Inc. (U22BLATN63)" build/resources/pritunl-openvpn
rm -rf openvpn_macos/openvpn_universal

# WireGuard
cp wireguard_macos/bash build/resources/bash
cp wireguard_macos/wg build/resources/wg
cp wireguard_macos/wg-quick build/resources/wg-quick
cp wireguard_macos/wireguard-go build/resources/wireguard-go
codesign --force --timestamp --options=runtime -s "Developer ID Application: Pritunl, Inc. (U22BLATN63)" build/resources/bash
codesign --force --timestamp --options=runtime -s "Developer ID Application: Pritunl, Inc. (U22BLATN63)" build/resources/wg
codesign --force --timestamp --options=runtime -s "Developer ID Application: Pritunl, Inc. (U22BLATN63)" build/resources/wg-quick
codesign --force --timestamp --options=runtime -s "Developer ID Application: Pritunl, Inc. (U22BLATN63)" build/resources/wireguard-go

# Pritunl
mkdir -p build/macos/Applications
cd client
npm install
./node_modules/.bin/electron-rebuild
node package.js

cd ../
mv build/macos/Applications/Pritunl-darwin-universal/Pritunl.app build/macos/Applications/
rm -rf build/macos/Applications/Pritunl-darwin-universal
sleep 3
npx @electron/fuses read --app build/macos/Applications/Pritunl.app
#codesign --force --deep --timestamp --options=runtime --entitlements="./resources_macos/entitlements.plist" --sign "Developer ID Application: Pritunl, Inc. (U22BLATN63)" build/macos/Applications/Pritunl.app/Contents/MacOS/Pritunl

# Files
mkdir -p build/macos/var/run
touch build/macos/var/run/pritunl_auth
mkdir -p build/macos/var/log
touch build/macos/var/log/pritunl-client.log
touch build/macos/var/log/pritunl-client.log.1

# Service Daemon
mkdir -p build/macos/Library/LaunchDaemons
cp service_macos/com.pritunl.service.plist build/macos/Library/LaunchDaemons

# Package
chmod +x resources_macos/scripts/postinstall
chmod +x resources_macos/scripts/preinstall
cd build
pkgbuild --root macos --scripts ../resources_macos/scripts --sign "Developer ID Installer: Pritunl, Inc. (U22BLATN63)" --identifier com.pritunl.pkg.Pritunl --version $APP_VER --ownership recommended --install-location / Build.pkg
productbuild --resources ../resources_macos --distribution ../resources_macos/distribution.xml --sign "Developer ID Installer: Pritunl, Inc. (U22BLATN63)" --version $APP_VER Pritunl.pkg
zip Pritunl.pkg.zip Pritunl.pkg
rm -f Build.pkg

# Notarize
xcrun notarytool submit Pritunl.pkg --keychain-profile "Pritunl" --apple-id "contact@pritunl.com" --team-id U22BLATN63 --output-format json
sleep 10
xcrun notarytool history --keychain-profile "Pritunl" --apple-id "contact@pritunl.com" --team-id U22BLATN63

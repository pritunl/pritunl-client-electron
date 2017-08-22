#!/bin/bash
set -e

read -r -p "Install Pritunl Client? [y/N] " response
if ! [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]
then
    exit
fi

APP_VER="1.0.1436.36"

read -r -p "Use Local Build? [y/N]" response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]
then
    cd ..
else
    curl -L https://github.com/pritunl/pritunl-client-electron/archive/$APP_VER.tar.gz | tar x
    cd pritunl-client-electron-$APP_VER

fi

# Pritunl
mkdir -p build/osx/Applications
cd client
npm install
./node_modules/.bin/electron-rebuild
./node_modules/.bin/electron-packager ./ Pritunl --platform=darwin --arch=x64 --icon=./www/img/pritunl.icns --out=../build/osx/Applications
cd ../
mv build/osx/Applications/Pritunl-darwin-x64/Pritunl.app build/osx/Applications/
rm -rf build/osx/Applications/Pritunl-darwin-x64

# Service
cd service
GOPATH="$(pwd)/go" go get -d
GOPATH="$(pwd)/go" go build -v
cd ..
cp service/service build/osx/Applications/Pritunl.app/Contents/Resources/pritunl-service

# Service Daemon
mkdir -p build/osx/Library/LaunchDaemons
cp service_osx/com.pritunl.service.plist build/osx/Library/LaunchDaemons

# Client Agent
mkdir -p build/osx/Library/LaunchAgents
cp service_osx/com.pritunl.client.plist build/osx/Library/LaunchAgents

# Openvpn
cp openvpn_osx/openvpn build/osx/Applications/Pritunl.app/Contents/Resources/pritunl-openvpn

# Files
touch build/osx/Applications/Pritunl.app/Contents/Resources/auth
touch build/osx/Applications/Pritunl.app/Contents/Resources/pritunl.log
touch build/osx/Applications/Pritunl.app/Contents/Resources/pritunl.log.1

# Preinstall
echo "###################################################"
echo "Preinstall: Stopping pritunl service..."
echo "###################################################"
kill -2 $(ps aux | grep Pritunl.app | awk '{print $2}') &> /dev/null || true
sudo launchctl unload /Library/LaunchAgents/com.pritunl.client.plist &> /dev/null || true
sudo launchctl unload /Library/LaunchDaemons/com.pritunl.service.plist &> /dev/null || true

# Install
echo "###################################################"
echo "Installing..."
echo "###################################################"
sudo rm -rf /Applications/Pritunl.app
sudo cp -r build/osx/Applications/Pritunl.app /Applications
sudo cp -f build/osx/Library/LaunchAgents/com.pritunl.client.plist /Library/LaunchAgents/com.pritunl.client.plist
sudo cp -f build/osx/Library/LaunchDaemons/com.pritunl.service.plist /Library/LaunchDaemons/com.pritunl.service.plist

# Postinstall
echo "###################################################"
echo "Postinstall: Starting pritunl service..."
echo "###################################################"
sudo launchctl load /Library/LaunchDaemons/com.pritunl.service.plist

cd ..
rm -rf pritunl-client-electron-$APP_VER

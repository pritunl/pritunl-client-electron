#!/bin/bash
set -e

APP_VER="$(curl -s https://api.github.com/repos/pritunl/pritunl-client-electron/releases/latest | python -c 'import json,sys;print(json.load(sys.stdin)["tag_name"])')"

read -r -p "Install Pritunl Client v$APP_VER? [y/N] " response
if ! [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]
then
    exit
fi

ROOT_PATH="$(pwd)/pritunl-client-electron-$APP_VER"
function clean {
  rm -rf "$ROOT_PATH"
}

trap clean EXIT

curl -L https://github.com/pritunl/pritunl-client-electron/archive/$APP_VER.tar.gz | tar x
cd pritunl-client-electron-$APP_VER

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
sudo touch /var/run/pritunl_auth
sudo touch /var/log/pritunl.log
sudo touch /var/log/pritunl.log.1

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

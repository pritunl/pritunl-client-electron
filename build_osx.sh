rm -rf build/osx

# Pritunl
mkdir -p build/osx/Applications
./node_modules/.bin/electron-packager ./ Pritunl --platform=darwin --arch=x64 --version=0.27.3 --icon=./www/img/pritunl.icns --out=build/osx/Applications

# Service
cd service
go build -a
cd ..
mkdir -p build/osx/usr/local/bin
cp service/service build/osx/usr/local/bin/pritunl-service

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

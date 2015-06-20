cd "$( dirname "${BASH_SOURCE[0]}" )"
cd ../

# Pritunl
sudo cp -pR build/osx/Applications/Pritunl.app /Applications
sudo chown -R root:wheel /Applications/Pritunl.app

# Service
sudo mkdir -p /usr/local/bin
sudo cp build/osx/usr/local/bin/pritunl-service /usr/local/bin

# Service Daemon
mkdir -p /Library/LaunchDaemons
sudo cp build/osx/Library/LaunchDaemons/com.pritunl.service.plist /Library/LaunchDaemons

# Tuntap
#sudo mkdir -p /Library/Extensions
#sudo cp -pR build/osx/Library/Extensions/pritunl-tap.kext /Library/Extensions/
#sudo chown -R root:wheel /Library/Extensions/pritunl-tap.kext
#sudo cp -pR build/osx/Library/Extensions/pritunl-tun.kext /Library/Extensions/
#sudo chown -R root:wheel /Library/Extensions/pritunl-tun.kext
#sudo mkdir -p /Library/LaunchDaemons
#sudo cp build/osx/Library/LaunchDaemons/com.pritunl.tuntaposx.pritunl-tap.plist /Library/LaunchDaemons
#sudo cp build/osx/Library/LaunchDaemons/com.pritunl.tuntaposx.pritunl-tun.plist /Library/LaunchDaemons
#sudo kextload /Library/Extensions/pritunl-tap.kext
#sudo kextload /Library/Extensions/pritunl-tun.kext

# Openvpn
sudo mkdir -p /usr/local/bin
sudo cp build/osx/usr/local/bin/pritunl-openvpn /usr/local/bin

# Start Service
sudo launchctl load /Library/LaunchDaemons/com.pritunl.service.plist

echo "Installation Successful"

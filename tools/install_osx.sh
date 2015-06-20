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
sudo mkdir -p /Library/Extensions
sudo cp -pR build/osx/Library/Extensions/tap.kext /Library/Extensions/
sudo chown -R root:wheel /Library/Extensions/tap.kext
sudo cp -pR build/osx/Library/Extensions/tun.kext /Library/Extensions/
sudo chown -R root:wheel /Library/Extensions/tun.kext
sudo mkdir -p /Library/LaunchDaemons
sudo cp build/osx/Library/LaunchDaemons/net.sf.tuntaposx.tap.plist /Library/LaunchDaemons
sudo cp build/osx/Library/LaunchDaemons/net.sf.tuntaposx.tun.plist /Library/LaunchDaemons
sudo kextunload -b net.sf.tuntaposx.tap || true
sudo kextunload -b net.sf.tuntaposx.tun || true
sudo kextload /Library/Extensions/tap.kext || true
sudo kextload /Library/Extensions/tun.kext || true

# Openvpn
sudo mkdir -p /usr/local/bin
sudo cp build/osx/usr/local/bin/pritunl-openvpn /usr/local/bin

# Start Service
sudo launchctl unload /Library/LaunchDaemons/com.pritunl.service.plist || true
sudo launchctl load /Library/LaunchDaemons/com.pritunl.service.plist

echo "Installation Successful"

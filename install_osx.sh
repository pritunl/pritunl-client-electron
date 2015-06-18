# Pritunl
sudo cp -pR build/osx/Applications/Pritunl.app /Applications

# Tuntap
sudo mkdir -p /Library/Extensions
sudo cp -pR build/osx/Library/Extensions/tap.kext /Library/Extensions/
sudo cp -pR build/osx/Library/Extensions/tun.kext /Library/Extensions/
sudo mkdir -p /Library/LaunchDaemons
sudo cp build/osx/Library/LaunchDaemons/net.sf.tuntaposx.tap.plist /Library/LaunchDaemons
sudo cp build/osx/Library/LaunchDaemons/net.sf.tuntaposx.tun.plist /Library/LaunchDaemons

# Openvpn
sudo mkdir -p /usr/local/share/pritunl
sudo cp build/osx/usr/local/share/pritunl/openvpn /usr/local/share/pritunl

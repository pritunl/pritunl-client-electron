# Pritunl
sudo rm -rf /Applications/Pritunl.app

# Tuntap
sudo rm -rf /Library/Extensions/tap.kext
sudo rm -rf /Library/Extensions/tun.kext
sudo rm /Library/LaunchDaemons/net.sf.tuntaposx.tap.plist
sudo rm /Library/LaunchDaemons/net.sf.tuntaposx.tun.plist

# Openvpn
sudo rm -rf /usr/share/pritunl

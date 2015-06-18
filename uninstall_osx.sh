# Pritunl
sudo rm -rf /Applications/Pritunl.app

# Service
sudo rm -rf /usr/local/bin/pritunl-service

# Tuntap
sudo rm -rf /Library/Extensions/pritunl-tap.kext
sudo rm -rf /Library/Extensions/pritunl-tun.kext
sudo rm -f /Library/LaunchDaemons/com.pritunl.tuntaposx.pritunl-tap.plist
sudo rm -f /Library/LaunchDaemons/com.pritunl.tuntaposx.pritunl-tun.plist

# Openvpn
sudo rm -rf /usr/local/bin/pritunl-openvpn

echo "Uninstallation Successful"

# Stop Service
sudo launchctl unload /Library/LaunchDaemons/com.pritunl.service.plist

# Pritunl
sudo rm -rf /private/tmp/pritunl
sudo rm -rf /Applications/Pritunl.app
sudo rm -f /private/var/db/receipts/com.pritunl.pkg.Pritunl.bom
sudo rm -f /private/var/db/receipts/com.pritunl.pkg.Pritunl.plist

# Service
sudo rm -rf /usr/local/bin/pritunl-service

# Service Daemon
sudo rm -f /Library/LaunchDaemons/com.pritunl.service.plist

# Tuntap
sudo rm -rf /Library/Extensions/pritunl-tap.kext
sudo rm -rf /Library/Extensions/pritunl-tun.kext
sudo rm -f /Library/LaunchDaemons/com.pritunl.tuntaposx.pritunl-tap.plist
sudo rm -f /Library/LaunchDaemons/com.pritunl.tuntaposx.pritunl-tun.plist

# Openvpn
sudo rm -rf /usr/local/bin/pritunl-openvpn

echo "Uninstallation Successful"

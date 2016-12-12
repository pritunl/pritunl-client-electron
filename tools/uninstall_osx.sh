# Stop Pritunl
kill -2 $(ps aux | grep Pritunl.app | awk '{print $2}')
sudo launchctl unload /Library/LaunchAgents/com.pritunl.client.plist
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
sudo rm -rf /Library/Extensions/tap.kext
sudo rm -rf /Library/Extensions/tun.kext
sudo rm -f /Library/LaunchDaemons/net.sf.tuntaposx.tap.plist
sudo rm -f /Library/LaunchDaemons/net.sf.tuntaposx.tun.plist
sudo kextunload -b net.sf.tuntaposx.tap || true
sudo kextunload -b net.sf.tuntaposx.tun || true

# Openvpn
sudo rm -rf /usr/local/bin/pritunl-openvpn

echo "Uninstallation Successful"

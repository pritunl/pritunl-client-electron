# Stop Pritunl
kill -2 $(ps aux | grep Pritunl.app | awk '{print $2}') &> /dev/null || true
sudo launchctl unload /Library/LaunchAgents/com.pritunl.client.plist &> /dev/null || true
sudo launchctl unload /Library/LaunchDaemons/com.pritunl.service.plist &> /dev/null || true

# Pritunl
sudo rm -rf /Applications/Pritunl.app
sudo rm -f /Library/LaunchAgents/com.pritunl.client.plist
sudo rm -f /Library/LaunchDaemons/com.pritunl.service.plist
sudo rm -f /private/var/db/receipts/com.pritunl.pkg.Pritunl.bom
sudo rm -f /private/var/db/receipts/com.pritunl.pkg.Pritunl.plist

# Profile Files
rm -rf ~/Library/Application Support/pritunl
rm -rf ~/Library/Caches/pritunl
rm -rf ~/Library/Preferences/com.electron.pritunl.plist

# Old Files
sudo rm -rf /var/lib/pritunl
sudo rm -f /var/log/pritunl.log
sudo kextunload -b net.sf.tuntaposx.tap &> /dev/null || true
sudo kextunload -b net.sf.tuntaposx.tun &> /dev/null || true
sudo rm -rf /Library/Extensions/tap.kext
sudo rm -rf /Library/Extensions/tun.kext
sudo rm -f /Library/LaunchDaemons/net.sf.tuntaposx.tap.plist
sudo rm -f /Library/LaunchDaemons/net.sf.tuntaposx.tun.plist
sudo rm -rf /usr/local/bin/pritunl-openvpn
sudo rm -rf /usr/local/bin/pritunl-service

echo "###################################################"
echo "Uninstallation Successful"
echo "###################################################"

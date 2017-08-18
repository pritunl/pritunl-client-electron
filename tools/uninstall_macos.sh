#!/bin/bash
set -e

# Service
kill -2 $(ps aux | grep Pritunl.app | awk '{print $2}') &> /dev/null || true
sudo launchctl unload /Library/LaunchAgents/com.pritunl.client.plist &> /dev/null || true
sudo launchctl unload /Library/LaunchDaemons/com.pritunl.service.plist &> /dev/null || true

# Pritunl
sudo rm -rf /Applications/Pritunl.app
sudo rm -f /Library/LaunchAgents/com.pritunl.client.plist
sudo rm -f /Library/LaunchDaemons/com.pritunl.service.plist
sudo rm -f /private/var/db/receipts/com.pritunl.pkg.Pritunl.bom
sudo rm -f /private/var/db/receipts/com.pritunl.pkg.Pritunl.plist

# Profiles
rm -rf ~/Library/Application Support/pritunl
rm -rf ~/Library/Caches/pritunl
rm -rf ~/Library/Preferences/com.electron.pritunl.plist

echo "###################################################"
echo "Uninstallation Successful"
echo "###################################################"

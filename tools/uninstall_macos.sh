#!/bin/bash
set -e

read -r -p "Uninstall Pritunl Client? [y/N] " response
if ! [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]
then
    exit
fi

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
rm -rf ~/Library/Caches/pritunl
rm -rf ~/Library/Preferences/com.electron.pritunl.plist

# Files
sudo rm -f /var/run/pritunl_auth
sudo rm -f /var/run/pritunl.sock
sudo rm -f /var/log/pritunl.log
sudo rm -f /var/log/pritunl.log.1
sudo rm -f /var/log/pritunl-client.log
sudo rm -f /var/log/pritunl-client.log.1
sudo rm -rf /var/lib/pritunl-client

# Old Files
sudo rm -rf /var/lib/pritunl
sudo kextunload -b net.sf.tuntaposx.tap &> /dev/null || true
sudo kextunload -b net.sf.tuntaposx.tun &> /dev/null || true
sudo rm -rf /Library/Extensions/tap.kext
sudo rm -rf /Library/Extensions/tun.kext
sudo rm -f /Library/LaunchDaemons/net.sf.tuntaposx.tap.plist
sudo rm -f /Library/LaunchDaemons/net.sf.tuntaposx.tun.plist
sudo rm -rf /usr/local/bin/pritunl-openvpn
sudo rm -rf /usr/local/bin/pritunl-service

read -r -p "Clear Pritunl Client Secure Enclave Key? [y/N] " response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]
then
    sudo rm -rf /Library/Application\ Support/Pritunl
fi

echo "###################################################"
echo "Uninstallation Successful"
echo "###################################################"

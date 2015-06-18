mkdir -p /Library/Extensions
cp -pR tap.kext /Library/Extensions/
chown -R root:wheel /Library/Extensions/tap.kext
cp -pR tun.kext /Library/Extensions/
chown -R root:wheel /Library/Extensions/tun.kext

mkdir -p /Library/LaunchDaemons
cp net.sf.tuntaposx.tap.plist /Library/LaunchDaemons/
chown root:wheel /Library/LaunchDaemons/net.sf.tuntaposx.tap.plist
cp net.sf.tuntaposx.tun.plist /Library/LaunchDaemons/
chown root:wheel /Library/LaunchDaemons/net.sf.tuntaposx.tun.plist

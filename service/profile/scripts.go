package profile

const (
	blockScript = "#!/bin/bash\n"
	upScript    = `#!/bin/bash -e
case $script_type in
up)
  for optionname in ${!foreign_option_*} ; do
    option="${!optionname}"
    echo $option
    part1=$(echo "$option" | cut -d " " -f 1)
    if [ "$part1" == "dhcp-option" ] ; then
      part2=$(echo "$option" | cut -d " " -f 2)
      part3=$(echo "$option" | cut -d " " -f 3)
      if [ "$part2" == "DNS" ] ; then
        DNS_SERVERS="$DNS_SERVERS $part3"
      fi
      if [[ "$part2" == "DOMAIN" || "$part2" == "DOMAIN-SEARCH" ]] ; then
        DNS_SEARCH="$DNS_SEARCH $part3"
      fi
    fi
  done

  SERVICE_ID="$( /usr/sbin/scutil <<-EOF |
open
show State:/Network/Global/IPv4
quit
EOF
grep PrimaryService | sed -e 's/.*PrimaryService : //'
)"

  if [ "$DNS_SERVERS" ] && [ "$DNS_SEARCH" ]; then
	/usr/sbin/scutil <<-EOF > /dev/null
open
d.init
d.add ServerAddresses * ${DNS_SERVERS}
d.add SearchDomains * ${DNS_SEARCH}
set State:/Network/Service/${SERVICE_ID}/DNS
d.init
d.add ServerAddresses * ${DNS_SERVERS}
d.add SearchDomains * ${DNS_SEARCH}
set Setup:/Network/Service/${SERVICE_ID}/DNS
get State:/Network/Service/${SERVICE_ID}/DNS
set State:/Network/Pritunl/DNS
quit
EOF
  elif [ "$DNS_SERVERS" ]; then
	/usr/sbin/scutil <<-EOF > /dev/null
open
d.init
d.add ServerAddresses * ${DNS_SERVERS}
set State:/Network/Service/${SERVICE_ID}/DNS
d.init
d.add ServerAddresses * ${DNS_SERVERS}
set Setup:/Network/Service/${SERVICE_ID}/DNS
get State:/Network/Service/${SERVICE_ID}/DNS
set State:/Network/Pritunl/DNS
quit
EOF
  elif [ "$DNS_SEARCH" ]; then
	/usr/sbin/scutil <<-EOF > /dev/null
open
d.init
d.add SearchDomains * ${DNS_SEARCH}
set State:/Network/Service/${SERVICE_ID}/DNS
d.init
d.add SearchDomains * ${DNS_SEARCH}
set Setup:/Network/Service/${SERVICE_ID}/DNS
get State:/Network/Service/${SERVICE_ID}/DNS
set State:/Network/Pritunl/DNS
quit
EOF
  fi
  ;;
esac

exit 0`
)

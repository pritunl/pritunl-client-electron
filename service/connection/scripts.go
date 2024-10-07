package connection

const (
	blockScript        = "#!/bin/bash\n"
	blockScriptWindows = "@echo off\n"
	upScriptDarwin     = `#!/bin/bash -e

CONN_ID="$(echo ${config} | /sbin/md5)"

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
    if [[ "$part2" == "DOMAIN-SEARCH" ]] ; then
      DNS_SEARCH="$DNS_SEARCH $part3"
    fi
  fi
done

if [ -z "$DNS_SERVERS" ] && [ -z "$DNS_SEARCH" ]; then
  exit 0
fi

if [ "$DNS_SERVERS" ] && [ "$DNS_SEARCH" ]; then
  /usr/sbin/scutil <<-EOF > /dev/null
open
d.init
d.add ServerAddresses * ${DNS_SERVERS}
d.add SearchDomains * ${DNS_SEARCH}
d.add SupplementalMatchDomains * ""
remove State:/Network/Service/Pritunl/DNS
remove Setup:/Network/Service/Pritunl/DNS
set State:/Network/Service/Pritunl/DNS
set Setup:/Network/Service/Pritunl/DNS
set State:/Network/Pritunl/Connection/${CONN_ID}
quit
EOF
elif [ "$DNS_SERVERS" ]; then
  /usr/sbin/scutil <<-EOF > /dev/null
open
d.init
d.add ServerAddresses * ${DNS_SERVERS}
d.add SupplementalMatchDomains * ""
remove State:/Network/Service/Pritunl/DNS
remove Setup:/Network/Service/Pritunl/DNS
set State:/Network/Service/Pritunl/DNS
set Setup:/Network/Service/Pritunl/DNS
set State:/Network/Pritunl/Connection/${CONN_ID}
quit
EOF
elif [ "$DNS_SEARCH" ]; then
  /usr/sbin/scutil <<-EOF > /dev/null
open
d.init
d.add SearchDomains * ${DNS_SEARCH}
d.add SupplementalMatchDomains * ""
remove State:/Network/Service/Pritunl/DNS
remove Setup:/Network/Service/Pritunl/DNS
set State:/Network/Service/Pritunl/DNS
set Setup:/Network/Service/Pritunl/DNS
set State:/Network/Pritunl/Connection/${CONN_ID}
quit
EOF
fi

if [ "$DNS_SEARCH" ]; then
SERVICE_ID="$(/usr/sbin/scutil <<-EOF |
open
show State:/Network/Global/IPv4
quit
EOF
grep PrimaryService | sed -e 's/.*PrimaryService : //'
)"
  /usr/sbin/scutil <<-EOF > /dev/null
open
get State:/Network/Service/${SERVICE_ID}/DNS
d.add SearchDomains * ${DNS_SEARCH}
set State:/Network/Service/${SERVICE_ID}/DNS
set Setup:/Network/Service/${SERVICE_ID}/DNS
quit
EOF
fi

/usr/bin/dscacheutil -flushcache || true
/usr/bin/killall -HUP mDNSResponder || true

exit 0
`
	upDnsScriptDarwin = `#!/bin/bash -e

CONN_ID="$(echo ${config} | /sbin/md5)"

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
    if [[ "$part2" == "DOMAIN-SEARCH" ]] ; then
      DNS_SEARCH="$DNS_SEARCH $part3"
    fi
  fi
done

if [ -z "$DNS_SERVERS" ] && [ -z "$DNS_SEARCH" ]; then
  exit 0
fi

if [ "$DNS_SERVERS" ] && [ "$DNS_SEARCH" ]; then
  /usr/sbin/scutil <<-EOF > /dev/null
open
d.init
d.add ServerAddresses * ${DNS_SERVERS}
d.add SearchDomains * ${DNS_SEARCH}
d.add SupplementalMatchDomains * ""
remove State:/Network/Service/Pritunl/DNS
remove Setup:/Network/Service/Pritunl/DNS
set State:/Network/Service/Pritunl/DNS
set Setup:/Network/Service/Pritunl/DNS
set State:/Network/Pritunl/Connection/${CONN_ID}
quit
EOF
elif [ "$DNS_SERVERS" ]; then
  /usr/sbin/scutil <<-EOF > /dev/null
open
d.init
d.add ServerAddresses * ${DNS_SERVERS}
d.add SupplementalMatchDomains * ""
remove State:/Network/Service/Pritunl/DNS
remove Setup:/Network/Service/Pritunl/DNS
set State:/Network/Service/Pritunl/DNS
set Setup:/Network/Service/Pritunl/DNS
set State:/Network/Pritunl/Connection/${CONN_ID}
quit
EOF
elif [ "$DNS_SEARCH" ]; then
  /usr/sbin/scutil <<-EOF > /dev/null
open
d.init
d.add SearchDomains * ${DNS_SEARCH}
d.add SupplementalMatchDomains * ""
remove State:/Network/Service/Pritunl/DNS
remove Setup:/Network/Service/Pritunl/DNS
set State:/Network/Service/Pritunl/DNS
set Setup:/Network/Service/Pritunl/DNS
set State:/Network/Pritunl/Connection/${CONN_ID}
quit
EOF
fi

if [ "$DNS_SEARCH" ]; then
SERVICE_ID="$(/usr/sbin/scutil <<-EOF |
open
show State:/Network/Global/IPv4
quit
EOF
grep PrimaryService | sed -e 's/.*PrimaryService : //'
)"
  /usr/sbin/scutil <<-EOF > /dev/null
open
get State:/Network/Service/${SERVICE_ID}/DNS
d.add SearchDomains * ${DNS_SEARCH}
set State:/Network/Service/${SERVICE_ID}/DNS
set Setup:/Network/Service/${SERVICE_ID}/DNS
quit
EOF
fi

/usr/sbin/networksetup -listallnetworkservices | grep -v "*" | while read service; do
  echo "SET $DNS_SERVERS ON $service";
  /usr/sbin/networksetup -setdnsservers "$service" ${DNS_SERVERS} || true;
done

/usr/bin/dscacheutil -flushcache || true
/usr/bin/killall -HUP mDNSResponder || true

exit 0
`
	downScriptDarwin = `#!/bin/bash -e

CONN_ID="$(echo ${config} | /sbin/md5)"

/usr/sbin/scutil <<-EOF > /dev/null
open
remove State:/Network/Service/Pritunl/DNS
remove Setup:/Network/Service/Pritunl/DNS
remove State:/Network/Pritunl/Connection/${CONN_ID}
quit
EOF

exit 0
`
	resolvScript = `#!/bin/bash
#
# Parses DHCP options from openvpn to update resolv.conf
# To use set as 'up' and 'down' script in your openvpn *.conf:
# up /etc/openvpn/update-resolv-conf
# down /etc/openvpn/update-resolv-conf
#
# Used snippets of resolvconf script by Thomas Hood <jdthood@yahoo.co.uk>
# and Chris Hanson
# Licensed under the GNU GPL.  See /usr/share/common-licenses/GPL.
# 07/2013 colin@daedrum.net Fixed intet name
# 05/2006 chlauber@bnc.ch
#
# Example envs set from openvpn:
# foreign_option_1='dhcp-option DNS 193.43.27.132'
# foreign_option_2='dhcp-option DNS 193.43.27.133'
# foreign_option_3='dhcp-option DOMAIN be.bnc.ch'
# foreign_option_4='dhcp-option DOMAIN-SEARCH bnc.local'

## You might need to set the path manually here, i.e.
RESOLVCONF=` + "`" + `which resolvconf` + "`" + `
if [[ -z "$RESOLVCONF" ]]; then
  if [ -x /usr/sbin/resolvconf ]; then
    RESOLVCONF=/sbin/resolvconf
  elif [ -x /usr/bin/resolvconf ]; then
    RESOLVCONF=/usr/bin/resolvconf
  elif [ -x /sbin/resolvconf ]; then
    RESOLVCONF=/sbin/resolvconf
  else
    RESOLVCONF=/bin/resolvconf
  fi
fi

[ -x "$RESOLVCONF" ] || exit 0

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
        IF_DNS_NAMESERVERS="$IF_DNS_NAMESERVERS $part3"
      fi
      if [[ "$part2" == "DOMAIN-SEARCH" ]] ; then
        IF_DNS_SEARCH="$IF_DNS_SEARCH $part3"
      fi
    fi
  done
  R=""
  if [ "$IF_DNS_SEARCH" ]; then
    R="search "
    for DS in $IF_DNS_SEARCH ; do
      R="${R} $DS"
    done
  R="${R}
"
  fi

  for NS in $IF_DNS_NAMESERVERS ; do
    R="${R}nameserver $NS
"
  done
  echo -n "$R" | $RESOLVCONF -a "${dev}.vpn"
  $RESOLVCONF -u || true
  ;;
down)
  $RESOLVCONF -d "${dev}.vpn"
  $RESOLVCONF -u || true
  ;;
esac
`
	resolvedScript = `#!/usr/bin/env bash
#
# OpenVPN helper to add DHCP information into systemd-resolved via DBus.
# Copyright (C) 2016, Jonathan Wright <jon@than.io>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

# This script will parse DHCP options set via OpenVPN (dhcp-option) to update
# systemd-resolved directly via DBus, instead of updating /etc/resolv.conf. To
# install, set as the 'up' and 'down' script in your OpenVPN configuration file
# or via the command-line arguments, alongside setting the 'down-pre' option to
# run the 'down' script before the device is closed. For example:
#   up /etc/openvpn/scripts/update-systemd-resolved
#   down /etc/openvpn/scripts/update-systemd-resolved
#   down-pre

# Define what needs to be called via DBus
DBUS_DEST="org.freedesktop.resolve1"
DBUS_NODE="/org/freedesktop/resolve1"

SCRIPT_NAME="${BASH_SOURCE[0]##*/}"

log() {
  logger -s -t "$SCRIPT_NAME" "$@"
}

for level in emerg err warning info debug; do
  printf -v functext -- '%s() { log -p user.%s -- "$@" ; }' "$level" "$level"
  eval "$functext"
done

usage() {
  err "${1:?${1}. }. Usage: ${SCRIPT_NAME} up|down device_name."
}

busctl_call() {
  # Preserve busctl's exit status
  /usr/bin/busctl call "$DBUS_DEST" "$DBUS_NODE" "${DBUS_DEST}.Manager" "$@" || {
    local -i status=$?
    emerg "'busctl' exited with status $status"
    return $status
  }
}

get_link_info() {
  dev="$1"
  shift

  link=''
  link="$(/sbin/ip link show dev "$dev")" || return $?

  echo "$dev" "${link%%:*}"
}

dhcp_settings() {
  for foreign_option in "${!foreign_option_@}"; do
    foreign_option_value="${!foreign_option}"

    [[ "$foreign_option_value" == *dhcp-option* ]] \
      && echo "${foreign_option_value#dhcp-option }"
  done
}

up() {
  local link="$1"
  shift
  local if_index="$1"
  shift

  info "Link '$link' coming up"

  # Preset values for processing -- will be altered in the various process_*
  # functions.
  local -a dns_servers=() dns_domain=() dns_search=() dns_routed=()
  local -i dns_server_count=0 dns_domain_count=0 dns_search_count=0 dns_routed_count=0
  local dns_sec=""

  while read -r setting; do
    setting_type="${setting%% *}"
    setting_value="${setting#* }"

    process_setting_function="${setting_type,,}"
    process_setting_function="process_${process_setting_function//-/_}"

    if declare -f "$process_setting_function" &>/dev/null; then
      "$process_setting_function" "$setting_value" || return $?
    else
      warning "Not a recognized DHCP setting: '${setting}'"
    fi
  done < <(dhcp_settings)

  if [[ "${#dns_servers[*]}" -gt 0 ]]; then
    busctl_params=("$if_index" "$dns_server_count" "${dns_servers[@]}")
    info "SetLinkDNS(${busctl_params[*]})"
    busctl_call SetLinkDNS 'ia(iay)' "${busctl_params[@]}" || return $?
  fi

  if [[ "${#dns_domain[*]}" -gt 0 \
     || "${#dns_search[*]}" -gt 0 \
     || "${#dns_routed[*]}" -gt 0 ]]; then
    dns_count=$((dns_domain_count+dns_search_count+dns_routed_count))
    busctl_params=("$if_index" "$dns_count")
    if [[ "${#dns_domain[*]}" -gt 0 ]]; then
      busctl_params+=("${dns_domain[@]}")
    fi
    if [[ "${#dns_search[*]}" -gt 0 ]]; then
      busctl_params+=("${dns_search[@]}")
    fi
    if [[ "${#dns_routed[*]}" -gt 0 ]]; then
      busctl_params+=("${dns_routed[@]}")
    fi
    info "SetLinkDomains(${busctl_params[*]})"
    busctl_call SetLinkDomains 'ia(sb)' "${busctl_params[@]}" || return $?
  fi

  if [[ -n "${dns_sec}" ]]; then
    if [[ "${dns_sec}" == "default" ]]; then
      # We need to provide an empty string to use the default settings
      info "SetLinkDNSSEC($if_index '')"
      busctl_call SetLinkDNSSEC 'is' "$if_index" "" || return $?
    else
      info "SetLinkDNSSEC($if_index ${dns_sec})"
      busctl_call SetLinkDNSSEC 'is' "$if_index" "${dns_sec}" || return $?
    fi
  fi
}

down() {
  local link="$1"
  shift
  local if_index="$1"
  shift

  info "Link '$link' going down"
  if [[ "$(whoami 2>/dev/null)" != "root" ]]; then
    # Cleanly handle the privilege dropped case by not calling RevertLink
    info "Privileges dropped in the client: Cannot call RevertLink."
  else
    busctl_call RevertLink i "$if_index"
  fi
}

process_dns() {
  address="$1"
  shift

  if looks_like_ipv6 "$address"; then
    process_dns_ipv6 "$address" || return $?
  elif looks_like_ipv4 "$address"; then
    process_dns_ipv4 "$address" || return $?
  else
    err "Not a valid IPv6 or IPv4 address: '$address'"
    return 1
  fi
}

process_dns6() {
  process_dns $1
}

looks_like_ipv4() {
  [[ -n "$1" ]] && {
    local dots="${1//[^.]}"
    (( ${#dots} == 3 ))
  }
}

looks_like_ipv6() {
  [[ -n "$1" ]] && {
    local colons="${1//[^:]}"
    (( ${#colons} >= 2 ))
  }
}

process_dns_ipv4() {
  local address="$1"
  shift

  info "Adding IPv4 DNS Server ${address}"
  (( dns_server_count += 1 ))
  dns_servers+=(2 4 ${address//./ })
}

# Enforces RFC 5952:
#   1. Don't shorten a single 0 field to '::'
#   2. Only longest run of zeros should be compressed
#   3. If there are multiple longest runs, the leftmost should be compressed
#   4. Address must be maximally compressed, so no all-zero runs next to '::'
#
# ...
#
# Thank goodness we don't have to handle port numbers, though :)
parse_ipv6() {
  local raw_address="$1"

  log_invalid_ipv6() {
    local message="'$raw_address' is not a valid IPv6 address"
    emerg "${message}: $*"
  }

  trap -- 'unset -f log_invalid_ipv6' RETURN

  if [[ "$raw_address" == *::*::* ]]; then
    log_invalid_ipv6 "address cannot contain more than one '::'"
    return 1
  elif [[ "$raw_address" =~ :0+:: ]] || [[ "$raw_address" =~ ::0+: ]]; then
    log_invalid_ipv6 "address contains a 0-group adjacent to '::' and is not maximally shortened"
    return 1
  fi

  local -i length=8
  local -a raw_segments=()

  IFS=$':' read -r -a raw_segments <<<"$raw_address"

  local -i raw_length="${#raw_segments[@]}"

  if (( raw_length > length )); then
    log_invalid_ipv6 "expected ${length} segments, got ${raw_length}"
    return 1
  fi

  # Store zero-runs keyed to their sizes, storing all non-zero segments prefixed
  # with a token marking them as such.
  local nonzero_prefix=$'!'
  local -i zero_run_i=0 compressed_i=0
  local -a tokenized_segments=()
  local decimal_segment='' next_decimal_segment=''

  for (( i = 0 ; i < raw_length ; i++ )); do
    raw_segment="${raw_segments[i]}"

    printf -v decimal_segment -- '%d' "0x${raw_segment:-0}"

    # We're in the compressed group.  The length of this run should be
    # enough to bring the total number of segments to 8.
    if [[ -z "$raw_segment" ]]; then
      (( compressed_i = zero_run_i ))

      # '+ 1' because the length of the current segment is counted in
      # 'raw_length'.
      (( tokenized_segments[zero_run_i] = ((length - raw_length) + 1) ))

      # If we have an address like '::1', skip processing the next group to
      # avoid double-counting the zero-run, and increment the number of
      # 0-groups to add since the second empty group is counted in
      # 'raw_length'.
      if [[ -z "${raw_segments[i + 1]}" ]]; then
        (( i++ ))
        (( tokenized_segments[zero_run_i]++ ))
      fi

      (( zero_run_i++ ))
    elif (( decimal_segment == 0 )); then
      (( tokenized_segments[zero_run_i]++ ))

      # The run is over if the next segment is not 0, so increment the
      # tracking index.
      printf -v next_decimal_segment -- '%d' "0x${raw_segments[i + 1]}"

      (( next_decimal_segment != 0 )) && (( zero_run_i++ ))
    else
      # Prefix the raw segment with 'nonzero_prefix' to mark this as a
      # non-zero field.
      tokenized_segments[zero_run_i]="${nonzero_prefix}${decimal_segment}"
      (( zero_run_i++ ))
    fi
  done

  if [[ "$raw_address" == *::* ]]; then
    if (( ${#tokenized_segments[*]} == length )); then
      log_invalid_ipv6 "single '0' fields should not be compressed"
      return 1
    else
      local -i largest_run_i=0 largest_run=0

      for (( i = 0 ; i < ${#tokenized_segments[@]}; i ++ )); do
        # Skip groups that aren't zero-runs
        [[ "${tokenized_segments[i]:0:1}" == "$nonzero_prefix" ]] && continue

        if (( tokenized_segments[i] > largest_run )); then
          (( largest_run_i = i ))
          largest_run="${tokenized_segments[i]}"
        fi
      done

      local -i compressed_run="${tokenized_segments[compressed_i]}"

      if (( largest_run > compressed_run )); then
        log_invalid_ipv6 "the compressed run of all-zero fields is smaller than the largest such run"
        return 1
      elif (( largest_run == compressed_run )) && (( largest_run_i < compressed_i )); then
        log_invalid_ipv6 "only the leftmost largest run of all-zero fields should be compressed"
        return 1
      fi
    fi
  fi

  for segment in "${tokenized_segments[@]}"; do
    if [[ "${segment:0:1}" == "$nonzero_prefix" ]]; then
      printf -- '%04x\n' "${segment#${nonzero_prefix}}"
    else
      for (( n = 0 ; n < segment ; n++ )); do
        echo 0000
      done
    fi
  done
}

process_dns_ipv6() {
  local address="$1"
  shift

  info "Adding IPv6 DNS Server ${address}"

  local -a segments=()
  segments=($(parse_ipv6 "$address")) || return $?

  # Add AF_INET6 and byte count
  dns_servers+=(10 16)
  for segment in "${segments[@]}"; do
    dns_servers+=("$((16#${segment:0:2}))" "$((16#${segment:2:2}))")
  done

  (( dns_server_count += 1 ))
}

process_domain() {
  local domain="$1"
  shift

  info "Adding DNS Domain ${domain}"
  if [[ $dns_domain_count -eq 1 ]]; then
    (( dns_search_count += 1 ))
    dns_search+=("${domain}" false)
  else
    (( dns_domain_count = 1 ))
    dns_domain+=("${domain}" false)
  fi
}

process_adapter_domain_suffix() {
  # This enables support for ADAPTER_DOMAIN_SUFFIX which is a Microsoft standard
  # which works in the same way as DOMAIN to set the primary search domain on
  # this specific link.
  process_domain "$@"
}

process_domain_search() {
  local domain="$1"
  shift

  info "Adding DNS Search Domain ${domain}"
  (( dns_search_count += 1 ))
  dns_search+=("${domain}" false)
}

process_domain_route() {
  local domain="$1"
  shift

  info "Adding DNS Routed Domain ${domain}"
  (( dns_routed_count += 1 ))
  dns_routed+=("${domain}" true)
}

process_dnssec() {
  local option="$1" setting=""
  shift

  case "${option,,}" in
    yes|true)
      setting="yes" ;;
    no|false)
      setting="no" ;;
    default)
      setting="default" ;;
    allow-downgrade)
      setting="allow-downgrade" ;;
    *)
      local message="'$option' is not a valid DNSSEC option"
      emerg "${message}"
      return 1 ;;
  esac

  info "Setting DNSSEC to ${setting}"
  dns_sec="${setting}"
}

main() {
  local script_type="${1}"
  shift
  local dev="${1:-$dev}"
  shift

  if [[ -z "$script_type" ]]; then
    usage 'No script type specified'
    return 1
  elif [[ -z "$dev" ]]; then
    usage 'No device name specified'
    return 1
  elif ! declare -f "${script_type}" &>/dev/null; then
    usage "Invalid script type: '${script_type}'"
    return 1
  else
    if ! read -r link if_index _ < <(get_link_info "$dev"); then
      usage "Invalid device name: '$dev'"
      return 1
    fi

    "$script_type" "$link" "$if_index" "$@" || return 1
    # Flush the DNS cache
    /bin/resolvectl flush-caches || true
  fi
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]] || [[ "$AUTOMATED_TESTING" == 1 ]]; then
  set -o nounset

  main "${script_type:-down}" "$@"
fi
`
)

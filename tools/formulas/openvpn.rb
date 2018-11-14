class Openvpn < Formula
  desc "SSL/TLS VPN implementing OSI layer 2 or 3 secure network extension"
  homepage "https://openvpn.net/index.php/download/community-downloads.html"
  url "https://swupdate.openvpn.org/community/releases/openvpn-2.4.6.tar.xz"
  mirror "https://build.openvpn.net/downloads/releases/openvpn-2.4.6.tar.xz"
  sha256 "4f6434fa541cc9e363434ea71a16a62cf2615fb2f16af5b38f43ab5939998c26"

  depends_on "pkg-config" => :build
  depends_on "lz4"
  depends_on "lzo"

  # Requires tuntap for < 10.10
  depends_on :macos => :yosemite

  depends_on "pkcs11-helper"
  depends_on "openssl"

  def install
    ENV["MACOSX_DEPLOYMENT_TARGET"] "10.6"
    ENV["OPENSSL_CFLAGS"] = "-I/usr/local/opt/openssl/include"
    ENV["OPENSSL_SSL_CFLAGS"] = "-I/usr/local/opt/openssl/include"
    ENV["OPENSSL_CRYPTO_CFLAGS"] = "-I/usr/local/opt/openssl/include"
    ENV["OPENSSL_LIBS"] = "/usr/local/opt/openssl/lib/libssl.a -lz /usr/local/opt/openssl/lib/libcrypto.a -lz"
    ENV["OPENSSL_SSL_LIBS"] = "/usr/local/opt/openssl/lib/libssl.a"
    ENV["OPENSSL_CRYPTO_LIBS"] = "/usr/local/opt/openssl/lib/libcrypto.a -lz"
    ENV["PKCS11_HELPER_CFLAGS"] = "-I/usr/local/opt/pkcs11-helper/include"
    ENV["PKCS11_HELPER_LIBS"] = "-L/usr/local/opt/pkcs11-helper/lib -lpkcs11-helper"
    ENV["LZO_CFLAGS"] = "-I/usr/local/opt/lzo/include"
    ENV["LZO_LIBS"] = "/usr/local/opt/lzo/lib/liblzo2.a"
    ENV["OPTIONAL_LZO_LIBS"] = "/usr/local/opt/lzo/lib/liblzo2.a"
    ENV["LZ4_CFLAGS"] = "-I/usr/local/opt/lz4/include"
    ENV["LZ4_LIBS"] = "/usr/local/opt/lz4/lib/liblz4.a"

    system "./configure", "--disable-debug",
                          "--disable-dependency-tracking",
                          "--disable-silent-rules",
                          "--disable-server",
                          "--disable-management",
                          "--disable-plugins",
                          "--disable-plugin-auth-pam",
                          "--disable-plugin-down-root",
                          "--with-crypto-library=openssl",
                          "--enable-pkcs11",
                          "--enable-static",
                          "--disable-shared",
                          "--prefix=#{prefix}"
    system "make", "install"

    inreplace "sample/sample-config-files/openvpn-startup.sh",
              "/etc/openvpn", "#{etc}/openvpn"

    # We don't use mbedtls, so this file is unnecessary & somewhat confusing.
    rm doc/"README.mbedtls"
  end

  def post_install
    (var/"run/openvpn").mkpath
  end

  plist_options :startup => true

  def plist; <<~EOS
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd";>
    <plist version="1.0">
    <dict>
      <key>Label</key>
      <string>#{plist_name}</string>
      <key>ProgramArguments</key>
      <array>
        <string>#{opt_sbin}/openvpn</string>
        <string>--config</string>
        <string>#{etc}/openvpn/openvpn.conf</string>
      </array>
      <key>OnDemand</key>
      <false/>
      <key>RunAtLoad</key>
      <true/>
      <key>TimeOut</key>
      <integer>90</integer>
      <key>WatchPaths</key>
      <array>
        <string>#{etc}/openvpn</string>
      </array>
      <key>WorkingDirectory</key>
      <string>#{etc}/openvpn</string>
    </dict>
    </plist>
  EOS
  end

  test do
    system sbin/"openvpn", "--show-ciphers"
  end
end

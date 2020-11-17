class Pkcs11Helper < Formula
  desc "Library to simplify the interaction with PKCS#11"
  homepage "https://github.com/OpenSC/OpenSC/wiki/pkcs11-helper"
  url "https://github.com/OpenSC/pkcs11-helper/releases/download/pkcs11-helper-1.26/pkcs11-helper-1.26.0.tar.bz2"
  sha256 "e886ec3ad17667a3694b11a71317c584839562f74b29c609d54c002973b387be"
  head "https://github.com/OpenSC/pkcs11-helper.git"

  depends_on "autoconf" => :build
  depends_on "automake" => :build
  depends_on "libtool" => :build
  depends_on "pkg-config" => :build
  depends_on "openssl@1.1"

  def install
    ENV["CFLAGS"] = "-mmacosx-version-min=10.6"
    ENV["CXXFLAGS"] = "-mmacosx-version-min=10.6"
    ENV["CPPFLAGS"] = "-mmacosx-version-min=10.6"
    ENV["LINKFLAGS"] = "-mmacosx-version-min=10.6"

    ENV["OPENSSL_CFLAGS"] = "-I/usr/local/opt/openssl/include"
    ENV["OPENSSL_LIBS"] = "-L/usr/local/opt/openssl/lib -lssl -lcrypto -lz"

    args = %W[
      --disable-debug
      --disable-dependency-tracking
      --disable-threading
      --disable-slotevent
      --disable-crypto-engine-gnutls
      --disable-crypto-engine-nss
      --disable-crypto-engine-mbedtls
      --disable-shared
      --enable-static
      --prefix=#{prefix}
    ]

    system "autoreconf", "--verbose", "--install", "--force"
    system "./configure", *args
    system "make", "install"
  end

  test do
    (testpath/"test.c").write <<~EOS
      #include <stdio.h>
      #include <stdlib.h>
      #include <pkcs11-helper-1.0/pkcs11h-core.h>

      int main() {
        printf("Version: %08x", pkcs11h_getVersion ());
        return 0;
      }
    EOS
    system ENV.cc, testpath/"test.c", "-I#{include}", "-L#{lib}",
                   "-lpkcs11-helper", "-o", "test"
    system "./test"
  end
end

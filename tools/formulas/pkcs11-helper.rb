class Pkcs11Helper < Formula
  desc "Library to simplify the interaction with PKCS#11"
  homepage "https://github.com/OpenSC/OpenSC/wiki/pkcs11-helper"
  url "https://github.com/OpenSC/pkcs11-helper/releases/download/pkcs11-helper-1.25.1/pkcs11-helper-1.25.1.tar.bz2"
  sha256 "10dd8a1dbcf41ece051fdc3e9642b8c8111fe2c524cb966c0870ef3413c75a77"
  head "https://github.com/OpenSC/pkcs11-helper.git"

  depends_on "autoconf" => :build
  depends_on "automake" => :build
  depends_on "libtool" => :build
  depends_on "pkg-config" => :build
  depends_on "openssl"

  def install
    ENV.append_to_cflags "-mmacosx-version-min=10.6"
    ENV["CCFLAGS"] = "-mmacosx-version-min=10.6"
    ENV["LINKFLAGS"] = "-mmacosx-version-min=10.6"

    ENV["OPENSSL_CFLAGS"] = "-I/usr/local/opt/openssl/include"
    ENV["OPENSSL_LIBS"] = "-L/usr/local/opt/openssl/lib -lssl -lcrypto -lz"

    args = %W[
      --disable-debug
      --disable-dependency-tracking
      --disable-threading
      --disable-slotevent
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

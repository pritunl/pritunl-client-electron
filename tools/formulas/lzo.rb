class Lzo < Formula
  desc "Real-time data compression library"
  homepage "https://www.oberhumer.com/opensource/lzo/"
  url "https://www.oberhumer.com/opensource/lzo/download/lzo-2.10.tar.gz"
  sha256 "c0f892943208266f9b6543b3ae308fab6284c5c90e627931446fb49b4221a072"

  def install
    ENV["CFLAGS"] = "-mmacosx-version-min=10.6"
    ENV["CXXFLAGS"] = "-mmacosx-version-min=10.6"
    ENV["CPPFLAGS"] = "-mmacosx-version-min=10.6"
    ENV["LINKFLAGS"] = "-mmacosx-version-min=10.6"

    system "./configure", "--disable-dependency-tracking",
                          "--prefix=#{prefix}",
                          "--enable-static",
                          "--disable-shared"
    system "make"
    system "make", "check"
    system "make", "install"
  end

  test do
    (testpath/"test.c").write <<~EOS
      #include <lzo/lzoconf.h>
      #include <stdio.h>

      int main()
      {
        printf("Testing LZO v%s in Homebrew.\\n",
        LZO_VERSION_STRING);
        return 0;
      }
    EOS
    system ENV.cc, "test.c", "-I#{include}", "-L#{lib}", "-o", "test"
    assert_match "Testing LZO v#{version} in Homebrew.", shell_output("./test")
  end
end

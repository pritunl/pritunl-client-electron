class PkgConfig < Formula
  desc "Manage compile and link flags for libraries"
  homepage "https://freedesktop.org/wiki/Software/pkg-config/"
  url "https://pkgconfig.freedesktop.org/releases/pkg-config-0.29.2.tar.gz"
  mirror "https://dl.bintray.com/homebrew/mirror/pkg-config-0.29.2.tar.gz"
  mirror "http://fco.it.distfiles.macports.org/mirrors/macports-distfiles/pkgconfig/pkg-config-0.29.2.tar.gz"
  sha256 "6fc69c01688c9458a57eb9a1664c9aba372ccda420a02bf4429fe610e7e7d591"

  def install
    ENV["CFLAGS"] = "-mmacosx-version-min=10.6"
    ENV["CXXFLAGS"] = "-mmacosx-version-min=10.6"
    ENV["CPPFLAGS"] = "-mmacosx-version-min=10.6"
    ENV["LINKFLAGS"] = "-mmacosx-version-min=10.6"

    pc_path = %W[
      #{HOMEBREW_PREFIX}/lib/pkgconfig
      #{HOMEBREW_PREFIX}/share/pkgconfig
      /usr/local/lib/pkgconfig
      /usr/lib/pkgconfig
      #{HOMEBREW_LIBRARY}/Homebrew/os/mac/pkgconfig/#{MacOS.version}
    ].uniq.join(File::PATH_SEPARATOR)

    system "./configure", "--disable-debug",
                          "--prefix=#{prefix}",
                          "--disable-host-tool",
                          "--with-internal-glib",
                          "--with-pc-path=#{pc_path}"
    system "make"
    system "make", "check"
    system "make", "install"
  end

  test do
    system "#{bin}/pkg-config", "--libs", "libpcre"
  end
end

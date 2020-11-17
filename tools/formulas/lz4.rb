class Lz4 < Formula
  desc "Extremely Fast Compression algorithm"
  homepage "https://lz4.org/"
  url "https://github.com/lz4/lz4/archive/v1.9.3.tar.gz"
  sha256 "030644df4611007ff7dc962d981f390361e6c97a34e5cbc393ddfbe019ffe2c1"
  head "https://github.com/lz4/lz4.git"

  def install
    ENV["CFLAGS"] = "-mmacosx-version-min=10.6"
    ENV["CXXFLAGS"] = "-mmacosx-version-min=10.6"
    ENV["CPPFLAGS"] = "-mmacosx-version-min=10.6"
    ENV["LINKFLAGS"] = "-mmacosx-version-min=10.6"

    system "make", "install", "PREFIX=#{prefix}"
  end

  test do
    input = "testing compression and decompression"
    input_file = testpath/"in"
    input_file.write input
    output_file = testpath/"out"
    system "sh", "-c", "cat #{input_file} | #{bin}/lz4 | #{bin}/lz4 -d > #{output_file}"
    assert_equal output_file.read, input
  end
end

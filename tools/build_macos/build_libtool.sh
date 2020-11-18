export CFLAGS="-mmacosx-version-min=11.0"
export CXXFLAGS="-mmacosx-version-min=11.0"
export CPPFLAGS="-mmacosx-version-min=11.0"
export LINKFLAGS="-mmacosx-version-min=11.0"

./configure --program-prefix=g
make
sudo make install

cd /usr/local/bin
sudo ln -s glibtool libtool
sudo ln -s glibtoolize libtoolize

cd service
go get -u -f
go build -v -a

cd ..\client
npm install
.\node_modules\.bin\electron-packager .\ pritunl --platform=win32 --arch=x64 --version=0.27.3 --icon=www\img\logo.ico --out=..\build\win --prune --asar

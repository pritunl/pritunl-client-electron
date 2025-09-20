### pritunl-client-www

```
npm install
```

#### locked packages

```
./node_modules/.bin/webpack
```

### development

```
cd service
sudo ./service

cd client
sed -i 's|dist/static|dist-dev/static|g' package.json
./node_modules/.bin/tsc --watch
./node_modules/.bin/webpack-cli --config webpack.dev.config --progress --color --watch
./node_modules/.bin/webpack-cli --config webpack-main.dev.config --progress --color --watch
./node_modules/.bin/electron . --dev-tools
```

#### production

```
sh build.sh
```

### clean

```
rm -rf app/*.js*
rm -rf app/**/*.js*
```

### internal

```
# desktop
rsync --human-readable --archive --xattrs --progress --delete --exclude "/node_modules/*" --exclude "/jspm_packages/*" --exclude "app/*.js" --exclude "app/*.js.map" --exclude "app/**/*.js" --exclude "app/**/*.js.map" /home/cloud/go/src/github.com/pritunl/pritunl-client-electron/client/ $NPM_SERVER:/home/cloud/pritunl-client-www/

# npm-server
cd /home/cloud/pritunl-cloud-www/
rm -rf node_modules
npm install

# desktop
scp $NPM_SERVER:/home/cloud/pritunl-client-www/package.json /home/cloud/go/src/github.com/pritunl/pritunl-client-electron/client/package.json
scp $NPM_SERVER:/home/cloud/pritunl-client-www/package-lock.json /home/cloud/go/src/github.com/pritunl/pritunl-client-electron/client/package-lock.json
rsync --human-readable --archive --xattrs --progress --delete $NPM_SERVER:/home/cloud/pritunl-client-www/node_modules/ /home/cloud/go/src/github.com/pritunl/pritunl-client-electron/client/node_modules/
rsync --human-readable --archive --xattrs --progress --delete --exclude "/node_modules/*" --exclude "/jspm_packages/*" --exclude "app/*.js" --exclude "app/*.js.map" --exclude "app/**/*.js" --exclude "app/**/*.js.map" /home/cloud/go/src/github.com/pritunl/pritunl-client-electron/client/ $NPM_SERVER:/home/cloud/pritunl-client-www/

# npm-server
sh build.sh

# desktop
rsync --human-readable --archive --xattrs --progress --delete $NPM_SERVER:/home/cloud/pritunl-client-www/dist/ /home/cloud/go/src/github.com/pritunl/pritunl-client-electron/client/dist/
rsync --human-readable --archive --xattrs --progress --delete $NPM_SERVER:/home/cloud/pritunl-client-www/dist-dev/ /home/cloud/go/src/github.com/pritunl/pritunl-client-electron/client/dist-dev/
```

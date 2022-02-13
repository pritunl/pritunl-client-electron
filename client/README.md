### pritunl-client-www

```
npm install
python3 patch.py
cd ./node_modules/@github/webauthn-json/dist/
ln -sf ./esm/* ./
cd ../../../../
```

#### lint

```
tslint -c tslint.json app/*.ts*
tslint -c tslint.json app/**/*.ts*
```

### development

```
tsc --watch
webpack-cli --config webpack.dev.config --progress --color --watch
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
rm package-lock.json
rm -rf node_modules
npm install
cd ./node_modules/@github/webauthn-json/dist/
ln -sf ./esm/* ./
cd ../../../../

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

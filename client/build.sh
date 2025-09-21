./node_modules/.bin/tsc

# development
rm -rf dist-dev/static
mkdir -p dist-dev/static
cp styles/fredoka-one.ttf dist-dev/static/
cp styles/global.css dist-dev/static/
cp styles/blueprint.css dist-dev/static/blueprint3.css
cp node_modules/normalize.css/normalize.css dist-dev/static/
cp node_modules/@blueprintjs/core/lib/css/blueprint.css dist-dev/static/blueprint5.css
cp node_modules/@blueprintjs/datetime2/lib/css/blueprint-datetime2.css dist-dev/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons.css dist-dev/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons-16.eot dist-dev/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons-16.svg dist-dev/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons-16.ttf dist-dev/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons-16.woff dist-dev/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons-16.woff2 dist-dev/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons-20.eot dist-dev/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons-20.svg dist-dev/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons-20.ttf dist-dev/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons-20.woff dist-dev/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons-20.woff2 dist-dev/static/
cp static/RobotoMono-Regular.ttf dist-dev/static/
cp static/RobotoMono-Medium.ttf dist-dev/static/
cp -r node_modules/monaco-editor/min/vs dist-dev/static/
node -e "fs=require('fs');f='dist-dev/static/blueprint-icons.css';fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace(/..\/..\/resources\/icons\//g,''))"

./node_modules/.bin/webpack --config webpack.dev.config
./node_modules/.bin/webpack --config webpack-main.dev.config

cp index.html dist-dev/index.html

# production
rm -rf dist/static
mkdir -p dist/static
cp styles/fredoka-one.ttf dist/static/
cp styles/global.css dist/static/
cp styles/blueprint.css dist/static/blueprint3.css
cp node_modules/normalize.css/normalize.css dist/static/
cp node_modules/@blueprintjs/core/lib/css/blueprint.css dist/static/blueprint5.css
cp node_modules/@blueprintjs/datetime2/lib/css/blueprint-datetime2.css dist/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons.css dist/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons-16.eot dist/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons-16.svg dist/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons-16.ttf dist/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons-16.woff dist/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons-16.woff2 dist/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons-20.eot dist/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons-20.svg dist/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons-20.ttf dist/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons-20.woff dist/static/
cp node_modules/@blueprintjs/icons/lib/css/blueprint-icons-20.woff2 dist/static/
cp static/RobotoMono-Regular.ttf dist/static/
cp static/RobotoMono-Medium.ttf dist/static/
cp -r node_modules/monaco-editor/min/vs dist/static/
node -e "fs=require('fs');f='dist/static/blueprint-icons.css';fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace(/..\/..\/resources\/icons\//g,''))"

./node_modules/.bin/webpack --config webpack.config
./node_modules/.bin/webpack --config webpack-main.config

cp index_dist.html dist/index.html

APP_HASH=`md5sum dist/static/app.js | cut -c1-6`

mv dist/static/app.js dist/static/app.${APP_HASH}.js
mv dist/static/app.js.map dist/static/app.${APP_HASH}.js.map

node -e "fs=require('fs');f='dist/index.html';fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace(/static\/app\.js\.map/g,'static/app.${APP_HASH}.js.map'))"
node -e "fs=require('fs');f='dist/index.html';fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace(/static\/app\.js/g,'static/app.${APP_HASH}.js'))"

# orig
cp -r www/* dist/
cp -r www/* dist-dev/

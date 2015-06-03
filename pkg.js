#!/usr/bin/env node
var os = require('os');
var pkgjson = require('./package.json');
var path = require('path');
var sh = require('shelljs');

var appVersion = pkgjson.version;
var appName = pkgjson.name;
var electronPackager = path.join('node_modules', '.bin', 'electron-packager');
var electronVersion = '0.26.0';
var icon = path.join('www', 'img', 'logo.png');

if (process.argv[2] === '--all') {
  var archs = ['ia32', 'x64'];
  var platforms = ['linux', 'win32', 'darwin'];

  platforms.forEach(function (plat) {
    archs.forEach(function (arch) {
      pack(plat, arch);
    })
  })
} else {
  pack(os.platform(), os.arch());
}

function pack (plat, arch) {
  var outputPath = path.join('pkg', appVersion, plat, arch);

  sh.exec(path.join('node_modules', '.bin', 'rimraf') + ' ' + outputPath);

  if (plat === 'darwin' && arch === 'ia32') {
    return;
  }

  var cmd = electronPackager + ' . ' + appName +
    ' --platform=' + plat +
    ' --arch=' + arch +
    ' --version=' + electronVersion +
    ' --app-version' + appVersion +
    // TODO ' --icon=' + icon +
    ' --out=' + outputPath +
    ' --prune' +
    ' --ignore=pkg';
  console.log(cmd);
  sh.exec(cmd)
}

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('resources/app/package.json'),
    windowsInstaller: {
      appDirectory: './',
      authors: 'Pritunl',
      exe: 'pritunl.exe'
    }
  });

  grunt.loadNpmTasks('grunt-electron-installer');

  grunt.registerTask('windows', 'windowsInstaller');
};

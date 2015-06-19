module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'create-windows-installer': {
      appDirectory: './',
      authors: 'Pritunl',
      title: 'Pritunl',
      description: 'Pritunl OpenVPN client',
      exe: 'pritunl.exe'
    }
  });

  grunt.loadNpmTasks('grunt-electron-installer');

  grunt.registerTask('windows', ['create-windows-installer']);
};

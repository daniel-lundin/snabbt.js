module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['snabbt.js']
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> v<%= pkg.version %> built: <%= grunt.template.today("yyyy-mm-dd") %>  (c)2015 Daniel Lundin @license MIT */\n'
      },
      dist: {
        files: {
          'snabbt.min.js': ['snabbt.js']
        }
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  


  // Default task(s).
  grunt.registerTask('default', ['jshint', 'uglify']);
};

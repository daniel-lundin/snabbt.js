module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      jquery: {
        src: 'src/*.js',
        dest: 'dist/jquery.snabbt.min.js'
      },
      standalone: {
        src: ['src/animations.js', 'src/easing.js', 'src/main.js', 'src/mat.js', 'src/state.js'],
        dest: 'dist/snabbt.min.js'
      }
    },
    concat: {
      options: {
        separator: ';',
      },
      jquery: {
        src: 'src/*.js',
        dest: 'src/jquery.snabbt.js',
      },
      dist: {
        src: ['src/animations.js', 'src/easing.js', 'src/main.js', 'src/mat.js', 'src/state.js'],
        dest: 'dist/snabbt.js'
      },
    },
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'concat']);
};

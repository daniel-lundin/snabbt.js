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
        src: ['src/animations.js', 'src/easing.js', 'src/main.js', 'src/mat.js'],
        dest: 'dist/snabbt.min.js'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);
};

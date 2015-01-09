module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> v<%= pkg.version %> built: <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      dist: {
        files: {
          'snabbt.min.js': ['snabbt.js']
        }
      },
    },
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['src/module_pre.js', 'src/animations.js', 'src/easing.js', 'src/jquery.snabbt.js', 'src/main.js', 'src/matrix.js', 'src/state.js', 'src/tween.js', 'src/utils.js', 'src/module_post.js'],
        dest: 'snabbt.js',
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');


  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify']);
};

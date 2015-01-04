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
        src: ['src/module_pre.js', 'src/animations.js', 'src/easing.js', 'src/jquery.snabbt.js', 'src/main.js', 'src/mat.js', 'src/state.js', 'src/tween.js', 'src/utils.js', 'src/module_post.js'],
        dest: 'snabbt.js',
      },
    }
    //,
    //umd: {
    //  all: {
    //    options: {
    //      src: 'concat.snabbt.js',
    //      dest: 'snabbt.js', // optional, if missing the src will be used
    //      objectToExport: 'snabbtjs', // optional, internal object that will be exported
    //      amdModuleId: 'snabbt-js', // optional, if missing the AMD module will be anonymous
    //    }
    //  }
    //}
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  //grunt.loadNpmTasks('grunt-umd');


  // Default task(s).
  //grunt.registerTask('default', ['concat', 'umd', 'uglify']);
  grunt.registerTask('default', ['concat', 'uglify']);
};

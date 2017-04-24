'use strict';

module.exports = function(grunt) {

  // Load Tasks
  grunt.loadNpmTasks('grunt-jscs'          );
  grunt.loadNpmTasks('grunt-mocha-test'    );
  grunt.loadNpmTasks('grunt-nodemon'       );  // avoid server restarts
  grunt.loadNpmTasks('grunt-contrib-watch' );

  // Configure Tasks
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jscs: {
      src: ['Gruntfile.js',
            '*.js',
            'lib/**/*.js',
            'models/**/*.js',
            'routes/**/*.js',
            'test/**/*.js'],
      options: {
        requireCurlyBraces: [false],
        verbose: false
      }
    },
    jshint: {
      dev: {
        src: ['Gruntfile.js',
            '!/build/bundle.js',
            '!/test/client/bundle.js',
            '*.js',
            'lib/**/*.js',
            'models/**/*.js',
            'routes/**/*.js',
            'test/**/*.js']
      },
      options: {
        jshintrc: true
      }
    },
    nodemon: {
      dev: {
        script: 'server.js'
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          captureFile: false,
          quiet: false,
          clearRequireCache: false
        },
        src: ['test/**/*_test.js']  // all test files
      }
    },
    watch: {

    },
  });

  // Custom Task Chains
  grunt.registerTask('test',       ['jshint:dev', 'jscs', 'mochaTest'   ]);
  grunt.registerTask('default',    ['test']);
};

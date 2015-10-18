module.exports = function(grunt) {
  'use strict';

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    jshint: {
      src: ['lib/*.js'],
      options: {
        reporter: require('jshint-stylish'),
        jshintrc: true
      }
    },

    jscs: {
      src: ['lib/*.js'],
      options: {
        config: '.jscsrc'
      }
    },

    mochaTest: {
      test: {
        options: {
          timeout: 60000,
          reporter: 'dot'
        },
        src: ['test/**/*.js']
      }
    }
  });

  grunt.registerTask('test', [
    'jshint',
    'jscs',
    'mochaTest'
  ]);
};
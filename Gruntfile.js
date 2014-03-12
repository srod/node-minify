module.exports = function(grunt) {
    'use strict';

    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        jshint: {
            dev: {
                src: ['lib/*.js'],
                options: {
                    reporter: require('jshint-stylish'),
                    jshintrc: '.jshintrc'
                }
            }
        }
    });

    grunt.registerTask('test', ['jshint:dev']);
};
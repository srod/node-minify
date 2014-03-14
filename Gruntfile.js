module.exports = function(grunt) {
    'use strict';

    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        jshint: {
            src: ['lib/*.js'],
            options: {
                reporter: require('jshint-stylish'),
                jshintrc: '.jshintrc'
            }
        },

        mochaTest: {
            test: {
                options: {
                    timeout: 15000,
                    reporter: 'spec'
                },
                src: ['test/**/*.js']
            }
        }
    });

    grunt.registerTask('test', ['jshint', 'mochaTest']);
};
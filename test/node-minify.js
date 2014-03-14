'use strict';

var should = require('should');
var compressor = require('../lib/node-minify');

var oneFile = __dirname + '/../examples/public/js/base.js';
var filesArray = [__dirname + '/../examples/public/js/base.js', __dirname + '/../examples/public/js/base2.js'];
var fileCSS = __dirname + '/../examples/public/css/base.css';
var fileCSSArray = [__dirname + '/../examples/public/css/base.css', __dirname + '/../examples/public/css/base2.css'];

var tests = {
    concat: [
        {
            it: 'should concat javascript and no compress',
            minify: {
                type: 'no-compress',
                fileIn: filesArray,
                fileOut: __dirname + '/../examples/public/js-dist/base-onefile-nocompress.js'
            }
        }
    ],
    sqwish: [
        {
            it: 'should compress css with sqwish and a single file',
            minify: {
                type: 'sqwish',
                fileIn: fileCSS,
                fileOut: __dirname + '/../examples/public/css/base-min-sqwish.css'
            }
        },
        {
            it: 'should compress css with sqwish and an array of file',
            minify: {
                type: 'sqwish',
                fileIn: fileCSSArray,
                fileOut: __dirname + '/../examples/public/css/base-onefile-sqwish.css'
            }
        }
    ],
    common: [
        {
            it: 'should compress javascript with {type} and a single file',
            minify: {
                type: '{type}',
                fileIn: oneFile,
                fileOut: __dirname + '/../examples/public/js-dist/base-min-{type}.js'
            }
        },
        {
            it: 'should compress javascript with {type} and a single file with a custom temp path',
            minify: {
                type: '{type}',
                fileIn: oneFile,
                fileOut: __dirname + '/../examples/public/js-dist/base-min-{type}.js',
                tempPath: '/tmp/'
            }
        },
        {
            it: 'should compress javascript with {type} and a single file with a custom public folder',
            minify: {
                type: '{type}',
                fileIn: 'base.js',
                fileOut: __dirname + '/../examples/public/js-dist/base-min-{type}.js',
                publicFolder: __dirname + '/../examples/public/js/'
            }
        },
        {
            it: 'should compress javascript with {type} and a single file with a custom public folder and a custom temp path',
            minify: {
                type: '{type}',
                fileIn: 'base.js',
                fileOut: __dirname + '/../examples/public/js-dist/base-min-{type}.js',
                publicFolder: __dirname + '/../examples/public/js/',
                tempPath: '/tmp/'
            }
        },
        {
            it: 'should compress javascript with {type} and an array of file',
            minify: {
                type: '{type}',
                fileIn: filesArray,
                fileOut: __dirname + '/../examples/public/js-dist/base-onefile-{type}.js'
            }
        },
        {
            it: 'should compress javascript with {type} and an array of file with a custom temp path',
            minify: {
                type: '{type}',
                fileIn: filesArray,
                fileOut: __dirname + '/../examples/public/js-dist/base-onefile-{type}.js',
                tempPath: '/tmp/'
            }
        },
        {
            it: 'should compress javascript with {type} and an array of file with a custom public folder',
            minify: {
                type: '{type}',
                fileIn: ['base.js', 'base2.js'],
                fileOut: __dirname + '/../examples/public/js-dist/base-onefile-{type}.js',
                publicFolder: __dirname + '/../examples/public/js/'
            }
        },
        {
            it: 'should compress javascript with {type} and an array of file with a custom public folder and a custom temp path',
            minify: {
                type: '{type}',
                fileIn: ['base.js', 'base2.js'],
                fileOut: __dirname + '/../examples/public/js-dist/base-onefile-{type}.js',
                publicFolder: __dirname + '/../examples/public/js/',
                tempPath: '/tmp/'
            }
        },
        {
            it: 'should compress javascript with {type} and wildcards path',
            minify: {
                type: '{type}',
                fileIn: __dirname + '/../examples/public/js/**/*.js',
                fileOut: __dirname + '/../examples/public/js-dist/base-onefile-{type}.js'
            }
        },
        {
            it: 'should compress javascript with {type} and wildcards path with a custom temp path',
            minify: {
                type: '{type}',
                fileIn: __dirname + '/../examples/public/js/**/*.js',
                fileOut: __dirname + '/../examples/public/js-dist/base-onefile-{type}.js',
                tempPath: '/tmp/'
            }
        },
        {
            it: 'should compress javascript with {type} and wildcards path with a custom public folder',
            minify: {
                type: '{type}',
                fileIn: '**/*.js',
                fileOut: __dirname + '/../examples/public/js-dist/base-onefile-{type}.js',
                publicFolder: __dirname + '/../examples/public/js/'
            }
        },
        {
            it: 'should compress javascript with {type} and wildcards path with a custom public folder and a custom temp path',
            minify: {
                type: '{type}',
                fileIn: '**/*.js',
                fileOut: __dirname + '/../examples/public/js-dist/base-onefile-{type}.js',
                publicFolder: __dirname + '/../examples/public/js/',
                tempPath: '/tmp/'
            }
        }
    ]
};

var runOneTest = function (options, type) {
    // extend object
    options = JSON.parse(JSON.stringify(options));

    options.minify.type = options.minify.type.replace('{type}', type);
    options.minify.fileOut = options.minify.fileOut.replace('{type}', type);

    it(options.it.replace('{type}', type), function(done) {
        options.minify.callback = function(err, min) {
            should.not.exist(err);
            should.exist(min);

            done();
        };

        new compressor.minify(options.minify);
    });
};

describe('node-minify', function () {
    describe('Concatenation', function() {
        tests.concat.forEach(function(o) {
            runOneTest(o, 'no-compress');
        });
    });

    describe('GCC', function() {
        tests.common.forEach(function(o) {
            runOneTest(o, 'gcc');
        });
    });

    describe('YUI', function() {
        tests.common.forEach(function (o) {
            runOneTest(o, 'yui-js');
        });
    });

    describe('UglifyJS', function() {
        tests.common.forEach(function (o) {
            runOneTest(o, 'uglifyjs');
        });
    });

    describe('Sqwish', function() {
        tests.sqwish.forEach(function (o) {
            runOneTest(o, 'sqwish');
        });
    });
});
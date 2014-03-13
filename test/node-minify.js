'use strict';

var should = require('should');
var compressor = require('../lib/node-minify');

var oneFile = __dirname + '/../examples/public/js/base.js';
var filesArray = [__dirname + '/../examples/public/js/base.js', __dirname + '/../examples/public/js/base2.js'];
var fileCSS = __dirname + '/../examples/public/css/base.css';

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
    gcc: [
        {
            it: 'should compress javascript with gcc and a single file',
            minify: {
                type: 'gcc',
                fileIn: oneFile,
                fileOut: __dirname + '/../examples/public/js-dist/base-min-gcc.js'
            }
        },
        {
            it: 'should compress javascript with gcc and a single file with a custom temp path',
            minify: {
                type: 'gcc',
                fileIn: oneFile,
                fileOut: __dirname + '/../examples/public/js-dist/base-min-gcc.js',
                tempPath: '/tmp/'
            }
        },
        {
            it: 'should compress javascript with gcc and an array of file',
            minify: {
                type: 'gcc',
                fileIn: filesArray,
                fileOut: __dirname + '/../examples/public/js-dist/base-onefile-gcc.js'
            }
        },
        {
            it: 'should compress javascript with gcc and an array of file with a custom temp path',
            minify: {
                type: 'gcc',
                fileIn: filesArray,
                fileOut: __dirname + '/../examples/public/js-dist/base-onefile-gcc.js',
                tempPath: '/tmp/'
            }
        }
    ],
    yui: [
        {
            it: 'should compress javascript with yui and a single file',
            minify: {
                type: 'yui-js',
                fileIn: oneFile,
                fileOut: __dirname + '/../examples/public/js-dist/base-min-yui.js'
            }
        },
        {
            it: 'should compress javascript with yui and a single file with a custom temp path',
            minify: {
                type: 'yui-js',
                fileIn: oneFile,
                fileOut: __dirname + '/../examples/public/js-dist/base-min-yui.js',
                tempPath: '/tmp/'
            }
        },
        {
            it: 'should compress javascript with yui and an array of file',
            minify: {
                type: 'yui-js',
                fileIn: filesArray,
                fileOut: __dirname + '/../examples/public/js-dist/base-onefile-yui.js'
            }
        },
        {
            it: 'should compress javascript with yui and an array of file with a custom temp path',
            minify: {
                type: 'yui-js',
                fileIn: filesArray,
                fileOut: __dirname + '/../examples/public/js-dist/base-onefile-yui.js',
                tempPath: '/tmp/'
            }
        },
        {
            it: 'should compress css with yui',
            minify: {
                type: 'yui-css',
                fileIn: fileCSS,
                fileOut: __dirname + '/../examples/public/js-dist/base-min-yui.css'
            }
        }
    ],
    uglify: [
        {
            it: 'should compress javascript with UglifyJS and a single file',
            minify: {
                type: 'uglifyjs',
                fileIn: oneFile,
                fileOut: __dirname + '/../examples/public/js-dist/base-min-uglify.js'
            }
        },
        {
            it: 'should compress javascript with UglifyJS and a single file with a custom temp path',
            minify: {
                type: 'uglifyjs',
                fileIn: oneFile,
                fileOut: __dirname + '/../examples/public/js-dist/base-min-uglify.js',
                tempPath: '/tmp/'
            }
        },
        {
            it: 'should compress javascript with UglifyJS and an array of file',
            minify: {
                type: 'uglifyjs',
                fileIn: filesArray,
                fileOut: __dirname + '/../examples/public/js-dist/base-onefile-uglify.js'
            }
        },
        {
            it: 'should compress javascript with UglifyJS and an array of file with a custom temp path',
            minify: {
                type: 'uglifyjs',
                fileIn: filesArray,
                fileOut: __dirname + '/../examples/public/js-dist/base-onefile-uglify.js',
                tempPath: '/tmp/'
            }
        }
    ]
};

var runOneTest = function (options) {
    it(options.it, function (done) {
        options.minify.callback = function (err, min) {
            should.not.exist(err);
            should.exist(min);

            done();
        };

        new compressor.minify(options.minify);
    });
};

describe('node-minify', function () {
    describe('Concatenation', function() {
        tests.concat.forEach(function (o) {
            runOneTest(o);
        });
    });

    describe('GCC', function() {
        tests.gcc.forEach(function (o) {
            runOneTest(o);
        });
    });

    describe('YUI', function() {
        tests.yui.forEach(function (o) {
            runOneTest(o);
        });
    });

    describe('UglifyJS', function() {
        tests.uglify.forEach(function (o) {
            runOneTest(o);
        });
    });
});
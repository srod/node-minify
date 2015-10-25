'use strict';

var fs = require('fs');
var os = require('os');
var mkdirp = require('mkdirp');
var should = require('should');
var expect = require('chai').expect;
var compressor = require('../lib/node-minify');

var oneFile = __dirname + '/../examples/public/js/base.js';
var filesArray = [
  __dirname + '/../examples/public/js/base.js',
  __dirname + '/../examples/public/js/base2.js'
];
var fileCSS = __dirname + '/../examples/public/css/base.css';
var fileCSSArray = [
  __dirname + '/../examples/public/css/base.css',
  __dirname + '/../examples/public/css/base2.css'
];

var tests = {
  concat: [
    {
      it: 'should concat javascript and no compress and an array of file',
      minify: {
        type: 'no-compress',
        fileIn: filesArray,
        fileOut: __dirname + '/../examples/public/js-dist/base-onefile-nocompress.js'
      }
    },
    {
      it: 'should concat javascript and no compress and a single file',
      minify: {
        type: 'no-compress',
        fileIn: oneFile,
        fileOut: __dirname + '/../examples/public/js-dist/base-onefile-nocompress.js'
      }
    }
  ],
  commoncss: [
    {
      it: 'should compress css with {type} and a single file',
      minify: {
        type: '{type}',
        fileIn: fileCSS,
        fileOut: __dirname + '/../examples/public/css/base-min-{type}.css'
      }
    },
    {
      it: 'should compress css with {type} and an array of file',
      minify: {
        type: '{type}',
        fileIn: fileCSSArray,
        fileOut: __dirname + '/../examples/public/css/base-onefile-{type}.css'
      }
    }
  ],
  commonjs: [
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
      it: 'should compress javascript with {type} and a single file with a custom buffer size',
      minify: {
        type: '{type}',
        fileIn: oneFile,
        fileOut: __dirname + '/../examples/public/js-dist/base-min-{type}.js',
        buffer: 2000 * 1024
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
        fileIn: [
          'base.js',
          'base2.js'
        ],
        fileOut: __dirname + '/../examples/public/js-dist/base-onefile-{type}.js',
        publicFolder: __dirname + '/../examples/public/js/'
      }
    },
    {
      it: 'should compress javascript with {type} and an array of file with a custom public folder and a custom temp path',
      minify: {
        type: '{type}',
        fileIn: [
          'base.js',
          'base2.js'
        ],
        fileOut: __dirname + '/../examples/public/js-dist/base-onefile-{type}.js',
        publicFolder: __dirname + '/../examples/public/js/',
        tempPath: '/tmp/'
      }
    },
    {
      it: 'should compress javascript with {type} and an array of file with a custom buffer size',
      minify: {
        type: '{type}',
        fileIn: filesArray,
        fileOut: __dirname + '/../examples/public/js-dist/base-onefile-{type}.js',
        buffer: 2000 * 1024
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
    },
    {
      it: 'should compress javascript with {type} and wildcards path with a custom buffer size',
      minify: {
        type: '{type}',
        fileIn: __dirname + '/../examples/public/js/**/*.js',
        fileOut: __dirname + '/../examples/public/js-dist/base-onefile-{type}.js',
        buffer: 2000 * 1024
      }
    }
  ]
};

var runOneTest = function(options, type, sync) {
  // extend object
  options = JSON.parse(JSON.stringify(options));

  options.minify.type = options.minify.type.replace('{type}', type);
  options.minify.fileOut = options.minify.fileOut.replace('{type}', type);

  if (sync) {
    options.minify.sync = true;
  }

  it(options.it.replace('{type}', type), function(done) {
    options.minify.callback = function(err, min) {
      should.not.exist(err);
      should.exist(min);

      done();
    };

    compressor.minify(options.minify);
  });
};

describe('node-minify', function() {
  mkdirp('/tmp/');

  describe('Fake binary', function() {
    it('should throw an error if binary does not exist', function(done) {
      var options = {};
      options.minify = {
        type: 'fake',
        fileIn: __dirname + '/../examples/public/js/**/*.js',
        fileOut: __dirname + '/../examples/public/js-dist/base-onefile-{type}.js'
      };

      expect(function() {
        compressor.minify(options.minify);
      }).to.throw();
      done();
    });
  });

  describe('No type', function() {
    it('should throw an error if no type', function(done) {
      var options = {};
      options.minify = {
        fileIn: __dirname + '/../examples/public/js/**/*.js',
        fileOut: __dirname + '/../examples/public/js-dist/base-onefile-{type}.js'
      };

      expect(function() {
        compressor.minify(options.minify);
      }).to.throw();
      done();
    });
  });

  describe('Deprecated', function() {
    it('should show a deprecated message', function(done) {
      var options = {};
      options.minify = {
        type: 'uglifyjs',
        fileIn: __dirname + '/../examples/public/js/**/*.js',
        fileOut: __dirname + '/../examples/public/js-dist/base-onefile-{type}.js'
      };

      options.minify.callback = function(err, min) {
        should.not.exist(err);
        should.exist(min);

        done();
      };

      new compressor.minify(options.minify);
    });
  });

  describe('Concatenation', function() {
    tests.concat.forEach(function(o) {
      runOneTest(o, 'no-compress');
    });
    tests.concat.forEach(function(o) {
      runOneTest(o, 'no-compress', true);
    });
  });

  describe('GCC', function() {
    tests.commonjs.forEach(function(o) {
      runOneTest(o, 'gcc');
    });
    tests.commonjs.forEach(function(o) {
      runOneTest(o, 'gcc', true);
    });
  });

  describe('YUI', function() {
    tests.commonjs.forEach(function(o) {
      runOneTest(o, 'yui-js');
    });
    tests.commonjs.forEach(function(o) {
      runOneTest(o, 'yui-js', true);
    });

    tests.commoncss.forEach(function(o) {
      runOneTest(o, 'yui-css');
    });
    tests.commoncss.forEach(function(o) {
      runOneTest(o, 'yui-css', true);
    });
  });

  describe('UglifyJS', function() {
    tests.commonjs.forEach(function(o) {
      runOneTest(o, 'uglifyjs');
    });
    tests.commonjs.forEach(function(o) {
      runOneTest(o, 'uglifyjs', true);
    });
  });

  describe('Clean-css', function() {
    tests.commoncss.forEach(function(o) {
      runOneTest(o, 'clean-css');
    });
    tests.commoncss.forEach(function(o) {
      runOneTest(o, 'clean-css', true);
    });
  });

  describe('CSSO', function() {
    tests.commoncss.forEach(function(o) {
      runOneTest(o, 'csso');
    });
    tests.commoncss.forEach(function(o) {
      runOneTest(o, 'csso', true);
    });
  });

  describe('Sqwish', function() {
    tests.commoncss.forEach(function(o) {
      runOneTest(o, 'sqwish');
    });
    tests.commoncss.forEach(function(o) {
      runOneTest(o, 'sqwish', true);
    });
  });

  describe('Sqwish with no binary', function() {
    before(function() {
      if (os.platform() === 'win32') {
        fs.renameSync(__dirname + '/../node_modules/.bin/sqwish.cmd', __dirname + '/../node_modules/.bin/sqwish.cmd.old');
      }
      fs.renameSync(__dirname + '/../node_modules/.bin/sqwish', __dirname + '/../node_modules/.bin/sqwish.old');
      fs.renameSync(__dirname + '/../node_modules/sqwish/bin/sqwish', __dirname + '/../node_modules/sqwish/bin/sqwish.old');
    });
    after(function() {
      if (os.platform() === 'win32') {
        fs.renameSync(__dirname + '/../node_modules/.bin/sqwish.cmd.old', __dirname + '/../node_modules/.bin/sqwish.cmd');
      }
      fs.renameSync(__dirname + '/../node_modules/.bin/sqwish.old', __dirname + '/../node_modules/.bin/sqwish');
      fs.renameSync(__dirname + '/../node_modules/sqwish/bin/sqwish.old', __dirname + '/../node_modules/sqwish/bin/sqwish');
    });
    it('should throw an error if binary does not exist', function(done) {
      var options = {};
      options.minify = {
        type: 'sqwish',
        fileIn: fileCSS,
        fileOut: __dirname + '/../examples/public/css/base-min-sqwish.css'
      };

      expect(function() {
        compressor.minify(options.minify);
      }).to.throw();
      done();
    });
  });
});

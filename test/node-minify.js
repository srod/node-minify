'use strict';

var fs = require('fs');
var os = require('os');
var child_process = require('child_process');
var mkdirp = require('mkdirp');
var sinon = require('sinon');
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

    it('should throw an error if no fileIn', function(done) {
      var options = {};
      options.minify = {
        type: 'no-compress',
        fileOut: __dirname + '/../examples/public/js-dist/base-onefile-{type}.js'
      };

      expect(function() {
        compressor.minify(options.minify);
      }).to.throw();
      done();
    });

    it('should throw an error if no fileOut', function(done) {
      var options = {};
      options.minify = {
        type: 'no-compress',
        fileIn: __dirname + '/../examples/public/js/**/*.js'
      };

      expect(function() {
        compressor.minify(options.minify);
      }).to.throw();
      done();
    });
  });

  describe('Create errors', function() {
    before(function() {
      fs.renameSync(__dirname + '/../lib/binaries/yuicompressor-2.4.7.jar', __dirname + '/../lib/binaries/yuicompressor-2.4.7.old.jar');
      this.stub = sinon.stub(child_process, 'execSync').throws();
    });
    after(function() {
      fs.renameSync(__dirname + '/../lib/binaries/yuicompressor-2.4.7.old.jar', __dirname + '/../lib/binaries/yuicompressor-2.4.7.jar');
      this.stub.restore();
    });
    it('should callback an error if binary does not exist on fs', function(done) {
      var options = {};
      options.minify = {
        type: 'yui',
        sync: true,
        fileIn: fileCSS,
        fileOut: __dirname + '/../examples/public/js-dist/base-min-yui.css'
      };

      options.minify.callback = function(err, min) {
        should.exist(err);
        should.not.exist(min);

        done();
      };

      compressor.minify(options.minify);
    });

    it('should throw on execSync', function(done) {
      var options = {};
      options.minify = {
        type: 'sqwish',
        fileIn: fileCSS,
        fileOut: __dirname + '/../examples/public/css/base-min-sqwish.css',
        sync: true,
        callback: function() {
          expect(child_process.execSync).to.have.been.called();
        }
      };

      expect(function() {
        compressor.minify(options.minify);
      }).to.throw();
      done();
    });
  });

  /*describe('Create more errors', function() {
    beforeEach(function() {
      this.stub = sinon.stub(child_process, 'execSync').throws();
    });
    afterEach(function() {
      this.stub.restore();
    });
    it('should throw on execSync', function(done) {
      var options = {};
      options.minify = {
        type: 'sqwish',
        fileIn: fileCSS,
        fileOut: __dirname + '/../examples/public/css/base-min-sqwish.css',
        sync: true,
        callback: function() {
          expect(child_process.execSync).to.have.been.called();
        }
      };

      expect(function() {
        compressor.minify(options.minify);
      }).to.throw();
      done();
    });
  });*/

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
      runOneTest(o, 'yui', true);
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
});

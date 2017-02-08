'use strict';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
jest.disableAutomock();

var childProcess = require('child_process');
//var decache = require('decache');
var mkdirp = require('mkdirp');
var nodeMinify = require('../lib/node-minify');

var oneFile = __dirname + '/../examples/public/js/sample.js';
var filesArray = [
  __dirname + '/../examples/public/js/sample.js',
  __dirname + '/../examples/public/js/sample2.js'
];
var filesArrayWithWildcards = [
  'sample.js',
  'sample2.js',
  '**/*.js'
];
var filesArrayWithWildcards2 = [
  __dirname + '/../examples/public/js/sample.js',
  __dirname + '/../examples/public/js/sample2.js',
  __dirname + '/../examples/public/js/**/*.js'
];
var fileJSOut = __dirname + '/../examples/public/dist/sample.js';
var fileCSS = __dirname + '/../examples/public/css/sample.css';
var fileCSSArray = [
  __dirname + '/../examples/public/css/sample.css',
  __dirname + '/../examples/public/css/sample2.css'
];
var fileCSSArrayWithWildcards = [
  'sample.css',
  'sample2.css',
  '/**/*.css'
];
var fileCSSArrayWithWildcards2 = [
  __dirname + '/../examples/public/css/sample.css',
  __dirname + '/../examples/public/css/sample2.css',
  __dirname + '/**/*.css'
];
var fileCSSOut = __dirname + '/../examples/public/dist/sample.css';

var tests = {
  concat: [
    {
      it: 'should concat javascript and no compress and an array of file',
      minify: {
        compressor: 'no-compress',
        input: filesArray,
        output: fileJSOut
      }
    },
    {
      it: 'should concat javascript and no compress and a single file',
      minify: {
        compressor: 'no-compress',
        input: oneFile,
        output: fileJSOut
      }
    }
  ],
  commoncss: [
    {
      it: 'should compress css with {compressor} and a single file',
      minify: {
        compressor: '{compressor}',
        input: fileCSS,
        output: fileCSSOut
      }
    },
    {
      it: 'should compress css with {compressor} and a single file with a custom public folder',
      minify: {
        compressor: '{compressor}',
        input: 'sample.css',
        output: fileCSSOut,
        publicFolder: __dirname + '/../examples/public/css/'
      }
    },
    {
      it: 'should compress css with {compressor} and a single file with a custom public folder and full path',
      minify: {
        compressor: '{compressor}',
        input: __dirname + '/../examples/public/css/sample.css',
        output: fileCSSOut,
        publicFolder: __dirname + '/../examples/public/css/'
      }
    },
    {
      it: 'should compress css with {compressor} and a single file with a custom buffer size',
      minify: {
        compressor: '{compressor}',
        input: fileCSS,
        output: fileCSSOut,
        buffer: 2000 * 1024
      }
    },
    {
      it: 'should compress css with {compressor} and a single file with some options',
      minify: {
        compressor: '{compressor}',
        input: fileCSS,
        output: fileCSSOut,
        options: {
          charset: 'utf8'
        }
      }
    },
    {
      it: 'should compress css with {compressor} and an array of file',
      minify: {
        compressor: '{compressor}',
        input: fileCSSArray,
        output: fileCSSOut
      }
    },
    {
      it: 'should compress css with {compressor} and an array of file with a custom public folder',
      minify: {
        compressor: '{compressor}',
        input: [
          'sample.css',
          'sample2.css'
        ],
        output: fileCSSOut,
        publicFolder: __dirname + '/../examples/public/css/'
      }
    },
    {
      it: 'should compress css with {compressor} and an array of file with a custom buffer size',
      minify: {
        compressor: '{compressor}',
        input: fileCSSArray,
        output: fileCSSOut,
        buffer: 2000 * 1024
      }
    },
    {
      it: 'should compress css with {compressor} and wildcards path',
      minify: {
        compressor: '{compressor}',
        input: __dirname + '/../examples/public/css/**/*.css',
        output: fileCSSOut
      }
    },
    {
      it: 'should compress css with {compressor} and wildcards path with a custom public folder',
      minify: {
        compressor: '{compressor}',
        input: '**/*.css',
        output: fileCSSOut,
        publicFolder: __dirname + '/../examples/public/css/'
      }
    },
    {
      it: 'should compress css with {compressor} and wildcards path with a custom buffer size',
      minify: {
        compressor: '{compressor}',
        input: __dirname + '/../examples/public/css/**/*.css',
        output: fileCSSOut,
        buffer: 2000 * 1024
      }
    },
    {
      it: 'should compress css with {compressor} and an array of strings and wildcards path',
      minify: {
        compressor: '{compressor}',
        input: fileCSSArrayWithWildcards2,
        output: fileCSSOut
      }
    },
    {
      it: 'should compress css with {compressor} and an array of strings and wildcards path' +
      ' with a custom public folder',
      minify: {
        compressor: '{compressor}',
        input: fileCSSArrayWithWildcards,
        output: fileCSSOut,
        publicFolder: __dirname + '/../examples/public/css/'
      }
    }
  ],
  commonjs: [
    {
      it: 'should compress javascript with {compressor} and a single file',
      minify: {
        compressor: '{compressor}',
        input: oneFile,
        output: fileJSOut
      }
    },
    {
      it: 'should compress javascript with {compressor} and a single file with a custom public folder',
      minify: {
        compressor: '{compressor}',
        input: 'sample.js',
        output: fileJSOut,
        publicFolder: __dirname + '/../examples/public/js/'
      }
    },
    {
      it: 'should compress javascript with {compressor} and a single file with a custom public folder and full path',
      minify: {
        compressor: '{compressor}',
        input: __dirname + '/../examples/public/js/sample.js',
        output: fileJSOut,
        publicFolder: __dirname + '/../examples/public/js/'
      }
    },
    {
      it: 'should compress javascript with {compressor} and a single file with a custom buffer size',
      minify: {
        compressor: '{compressor}',
        input: oneFile,
        output: fileJSOut,
        buffer: 2000 * 1024
      }
    },
    {
      it: 'should compress javascript with {compressor} and a single file with some options',
      minify: {
        compressor: '{compressor}',
        input: oneFile,
        output: fileJSOut,
        options: {
          charset: 'utf8'
        }
      }
    },
    {
      it: 'should compress javascript with {compressor} and an array of file',
      minify: {
        compressor: '{compressor}',
        input: filesArray,
        output: fileJSOut
      }
    },
    {
      it: 'should compress javascript with {compressor} and an array of file with a custom public folder',
      minify: {
        compressor: '{compressor}',
        input: [
          'sample.js',
          'sample2.js'
        ],
        output: fileJSOut,
        publicFolder: __dirname + '/../examples/public/js/'
      }
    },
    {
      it: 'should compress javascript with {compressor} and an array of file with a custom buffer size',
      minify: {
        compressor: '{compressor}',
        input: filesArray,
        output: fileJSOut,
        buffer: 2000 * 1024
      }
    },
    {
      it: 'should compress javascript with {compressor} and wildcards path',
      minify: {
        compressor: '{compressor}',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut
      }
    },
    {
      it: 'should compress javascript with {compressor} and wildcards path with a custom public folder',
      minify: {
        compressor: '{compressor}',
        input: '**/*.js',
        output: fileJSOut,
        publicFolder: __dirname + '/../examples/public/js/'
      }
    },
    {
      it: 'should compress javascript with {compressor} and wildcards path with a custom buffer size',
      minify: {
        compressor: '{compressor}',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut,
        buffer: 2000 * 1024
      }
    },
    {
      it: 'should compress javascript with {compressor} and an array of strings and wildcards path',
      minify: {
        compressor: '{compressor}',
        input: filesArrayWithWildcards2,
        output: fileJSOut
      }
    },
    {
      it: 'should compress javascript with {compressor} and an array of strings and wildcards path' +
      ' with a custom public folder',
      minify: {
        compressor: '{compressor}',
        input: filesArrayWithWildcards,
        output: fileJSOut,
        publicFolder: __dirname + '/../examples/public/js/'
      }
    }
  ],
  babili: [
    {
      it: 'should compress javascript with {compressor} and a single file with a babelrc',
      minify: {
        compressor: '{compressor}',
        input: oneFile,
        output: fileJSOut,
        options: {
          babelrc: __dirname + '/../examples/public/.babelrc'
        }
      }
    },
    {
      it: 'should compress javascript with {compressor} and a single file with a preset',
      minify: {
        compressor: '{compressor}',
        input: oneFile,
        output: fileJSOut,
        options: {
          presets: ['es2015']
        }
      }
    },
    {
      it: 'should compress javascript with {compressor} and a single file with a babelrc and preset',
      minify: {
        compressor: '{compressor}',
        input: oneFile,
        output: fileJSOut,
        options: {
          babelrc: __dirname + '/../examples/public/.babelrc',
          presets: ['es2015']
        }
      }
    }
  ]
};

var runOneTest = function(options, compressor, sync) {
  options = JSON.parse(JSON.stringify(options));

  options.minify.compressor = options.minify.compressor.replace('{compressor}', compressor);
  options.minify.output = options.minify.output.replace('{compressor}', compressor);

  if (sync) {
    options.minify.sync = true;
  }

  it(options.it.replace('{compressor}', compressor), function() {
    return new Promise(function(resolve) {
      options.minify.callback = function(err, min) {
        resolve(err, min);
      };

      nodeMinify.minify(options.minify);
    }).then(function(err, min) {
      expect(err).toBeNull();
      expect(min).not.toBeNull();
    });

    /*options.minify.callback = function(err, min) {
      expect(err).toBeNull();
      expect(min).not.toBeNull();
      done();
    };

    nodeMinify.minify(options.minify);*/
  });
};

describe('node-minify', function() {
  mkdirp('/tmp/');

  describe('Fake binary', function() {
    it('should throw an error if binary does not exist', function(done) {
      var options = {};
      options.minify = {
        compressor: 'fake',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut
      };

      expect(function() {
        nodeMinify.minify(options.minify);
      }).toThrowError(/does not exist/);
      done();
    });
  });

  describe('No mandatories', function() {
    it('should throw an error if no compressor', function(done) {
      var options = {};
      options.minify = {
        input: __dirname + '/../examples/public/js/!**!/!*.js',
        output: fileJSOut
      };

      expect(function() {
        nodeMinify.minify(options.minify);
      }).toThrowError(/mandatory/);
      done();
    });

    it('should throw an error if no input', function(done) {
      var options = {};
      options.minify = {
        compressor: 'no-compress',
        output: fileJSOut
      };

      expect(function() {
        nodeMinify.minify(options.minify);
      }).toThrowError(/input is mandatory/);
      done();
    });

    it('should throw an error if no output', function(done) {
      var options = {};
      options.minify = {
        compressor: 'no-compress',
        input: __dirname + '/../examples/public/js/!**/!*.js'
      };

      expect(function() {
        nodeMinify.minify(options.minify);
      }).toThrowError(/output is mandatory/);
      done();
    });
  });

  describe('Create errors', function() {
    it('should callback an error if gcc with bad options', function(done) {
      var options = {};
      options.minify = {
        compressor: 'gcc-java',
        input: oneFile,
        output: fileJSOut,
        options: {
          fake: true
        },
        callback: function(err, min) {
          expect(err).not.toBeNull();
          expect(min).toBeUndefined();
          done();
        }
      };

      nodeMinify.minify(options.minify);
    });

    it('should callback an error if yui with bad options', function(done) {
      var options = {};
      options.minify = {
        compressor: 'yui-js',
        input: oneFile,
        output: fileJSOut,
        sync: true,
        options: {
          fake: true
        },
        callback: function(err, min) {
          expect(err).not.toBeNull();
          expect(min).toBeUndefined();
          done();
        }
      };

      nodeMinify.minify(options.minify);
    });
  });

  describe('Create more errors', function() {
    beforeEach(function() {
      spyOn(childProcess, 'spawnSync').and.throwError('UnsupportedClassVersionError');
    });
    it('should callback an error on spawnSync', function(done) {
      var options = {};
      options.minify = {
        compressor: 'gcc-java',
        input: oneFile,
        output: fileJSOut,
        sync: true,
        callback: function(err, min) {
          expect(err).not.toBeNull();
          expect(min).toBeUndefined();
          done();
        }
      };

      nodeMinify.minify(options.minify);
    });
  });

  describe('Deprecated', function() {
    it('should show a deprecated message', function(done) {
      var options = {};
      options.minify = {
        compressor: 'uglifyjs',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut
      };

      options.minify.callback = function(err, min) {
        expect(err).toBeNull();
        expect(min).not.toBeNull();
        done();
      };

      new nodeMinify.minify(options.minify);
    });

    it('should show throw on type option', function(done) {
      var options = {};
      options.minify = {
        type: 'uglifyjs',
        input: __dirname + '/../examples/public/js/!**!/!*.js',
        output: fileJSOut
      };

      expect(function() {
        nodeMinify.minify(options.minify);
      }).toThrowError(/compressor is mandatory/);
      done();
    });

    it('should show throw on type fileIn', function(done) {
      var options = {};
      options.minify = {
        compressor: 'uglifyjs',
        fileIn: __dirname + '/../examples/public/js/!**!/!*.js',
        output: fileJSOut
      };

      expect(function() {
        nodeMinify.minify(options.minify);
      }).toThrowError(/input is mandatory/);
      done();
    });

    it('should show throw on type fileOut', function(done) {
      var options = {};
      options.minify = {
        compressor: 'uglifyjs',
        input: __dirname + '/../examples/public/js/!**/!*.js',
        fileOut: fileJSOut
      };

      expect(function() {
        nodeMinify.minify(options.minify);
      }).toThrowError(/output is mandatory/);
      done();
    });
  });

  /*describe('use_strict', function() {
    beforeEach(function() {
      this.originalExecArgv = JSON.parse(JSON.stringify(process.execArgv));
      process.execArgv.push('--use_strict');
      decache('../lib/node-minify');
    });
    afterEach(function() {
      process.execArgv = this.originalExecArgv;
    });
    it('should not throw with --use_strict flag', function(done) {
      var nodeMinify = require('../lib/node-minify');
      var options = {};
      options.minify = {
        compressor: 'gcc',
        input: __dirname + '/../examples/public/js/sample.js',
        output: fileJSOut
      };

      options.minify.callback = function(err, min) {
        expect(err).toBeNull();
        expect(min).not.toBeNull();

        done();
      };

      new nodeMinify.minify(options.minify);
    });
  });*/

  describe('Concatenation', function() {
    tests.concat.forEach(function(o) {
      runOneTest(o, 'no-compress');
    });
  });

  describe('Babili', function() {
    tests.commonjs.forEach(function(o) {
      runOneTest(o, 'babili');
    });
    tests.babili.forEach(function(o) {
      runOneTest(o, 'babili');
    });
    tests.commonjs.forEach(function(o) {
      runOneTest(o, 'babili', true);
    });
    tests.babili.forEach(function(o) {
      runOneTest(o, 'babili', true);
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

  describe('GCC Java', function() {
    tests.commonjs.forEach(function(o) {
      runOneTest(o, 'gcc-java');
    });
    tests.commonjs.forEach(function(o) {
      runOneTest(o, 'gcc-java', true);
    });
  });

  describe('GCC Legacy', function() {
    tests.commonjs.forEach(function(o) {
      runOneTest(o, 'gcc-legacy');
    });
    tests.commonjs.forEach(function(o) {
      runOneTest(o, 'gcc-legacy', true);
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
    it('should create a source map', function(done) {
      var options = {};
      options.minify = {
        compressor: 'uglifyjs',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut,
        options: {
          outSourceMap: fileJSOut + '.map'
        }
      };

      options.minify.callback = function(err, min) {
        should.not.exist(err);
        should.exist(min);

        done();
      };

      nodeMinify.minify(options.minify);
    });
  });

  describe('Clean-css', function() {
    tests.commoncss.forEach(function(o) {
      runOneTest(o, 'clean-css');
    });
  });

  describe('CSSO', function() {
    tests.commoncss.forEach(function(o) {
      runOneTest(o, 'csso');
    });
  });

  describe('Sqwish', function() {
    tests.commoncss.forEach(function(o) {
      runOneTest(o, 'sqwish');
    });
  });
});

/*!
 * node-minify
 * Copyright(c) 2011-2017 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

var childProcess = require('child_process');
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
      it: 'should compress javascript with {compressor} and a single file with empty options',
      minify: {
        compressor: '{compressor}',
        input: oneFile,
        output: fileJSOut,
        options: {}
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

  test(options.it.replace('{compressor}', compressor), function() {
    return new Promise(function(resolve) {
      options.minify.callback = function(err, min) {
        resolve(err, min);
      };

      nodeMinify.minify(options.minify);
    }).then(function(err, min) {
      expect(err).toBeNull();
      expect(min).not.toBeNull();
    });
  });
};

describe('node-minify', function() {
  mkdirp('/tmp/');

  describe('Fake binary', function() {
    test('should throw an error if binary does not exist', function() {
      var options = {};
      options.minify = {
        compressor: 'fake',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut
      };

      return nodeMinify.minify(options.minify)
      .catch(function(err) {
        return expect(err.toString()).toEqual('Error: Type "fake" does not exist');
      });
    });
  });

  describe('No mandatories', function() {
    test('should throw an error if no compressor', function() {
      var options = {};
      options.minify = {
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut
      };

      return nodeMinify.minify(options.minify)
      .catch(function(err) {
        return expect(err.toString()).toEqual('Error: compressor is mandatory.');
      });
    });

    test('should throw an error if no input', function() {
      var options = {};
      options.minify = {
        compressor: 'no-compress',
        output: fileJSOut
      };

      return nodeMinify.minify(options.minify)
      .catch(function(err) {
        return expect(err.toString()).toEqual('Error: input is mandatory.');
      });
    });

    test('should throw an error if no output', function() {
      var options = {};
      options.minify = {
        compressor: 'no-compress',
        input: __dirname + '/../examples/public/js/**/*.js'
      };

      return nodeMinify.minify(options.minify)
      .catch(function(err) {
        return expect(err.toString()).toEqual('Error: output is mandatory.');
      });
    });
  });

  describe('Create errors', function() {
    test('should callback an error if gcc with bad options', function() {
      var options = {};
      options.minify = {
        compressor: 'gcc-java',
        input: oneFile,
        output: fileJSOut,
        options: {
          fake: true
        },
        callback: function() {
        }
      };
      var spy = jest.spyOn(options.minify, 'callback');

      return nodeMinify.minify(options.minify)
      .catch(function(err) {
        expect(spy).toHaveBeenCalled();
        return expect(err.toString()).toMatch('Error: "--fake" is not a valid option');
      });
    });

    test('should callback an error if yui with bad options', function() {
      var options = {};
      options.minify = {
        compressor: 'yui-js',
        input: oneFile,
        output: fileJSOut,
        sync: true,
        options: {
          fake: true
        },
        callback: function() {
        }
      };
      var spy = jest.spyOn(options.minify, 'callback');

      return nodeMinify.minify(options.minify)
      .catch(function(err) {
        expect(spy).toHaveBeenCalled();
        return expect(err.toString()).toMatch('Usage: java -jar');
      });
    });
  });

  describe('Create more errors', function() {
    beforeEach(function() {
      spyOn(childProcess, 'spawnSync').and.throwError('UnsupportedClassVersionError');
    });
    test('should callback an error on spawnSync', function() {
      var options = {};
      options.minify = {
        compressor: 'gcc-java',
        input: oneFile,
        output: fileJSOut,
        sync: true,
        callback: function() {
        }
      };
      var spy = jest.spyOn(options.minify, 'callback');

      return nodeMinify.minify(options.minify)
      .catch(function(err) {
        expect(spy).toHaveBeenCalled();
        return expect(err.toString()).toEqual('Error: Latest Google Closure Compiler requires Java >= 1.7, please' +
          ' update Java or use gcc-legacy');
      });
    });
  });

  describe('Deprecated', function() {
    test('should show a deprecated message', function(done) {
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

    test('should show throw on type option', function() {
      var options = {};
      options.minify = {
        type: 'uglifyjs',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut,
        callback: function() {
        }
      };

      return nodeMinify.minify(options.minify)
      .catch(function(err) {
        return expect(err.toString()).toEqual('Error: compressor is mandatory.');
      });
    });

    test('should show throw on type fileIn', function() {
      var options = {};
      options.minify = {
        compressor: 'uglifyjs',
        fileIn: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut
      };

      return nodeMinify.minify(options.minify)
      .catch(function(err) {
        return expect(err.toString()).toEqual('Error: input is mandatory.');
      });
    });

    test('should show throw on type fileOut', function() {
      var options = {};
      options.minify = {
        compressor: 'uglifyjs',
        input: __dirname + '/../examples/public/js/**/*.js',
        fileOut: fileJSOut
      };

      return nodeMinify.minify(options.minify)
      .catch(function(err) {
        return expect(err.toString()).toEqual('Error: output is mandatory.');
      });
    });
  });

  describe('use_strict', function() {
    beforeEach(function() {
      this.originalExecArgv = JSON.parse(JSON.stringify(process.execArgv));
      process.execArgv.push('--use_strict');
    });
    afterEach(function() {
      process.execArgv = this.originalExecArgv;
    });
    test('should not throw with --use_strict flag', function(done) {
      jest.resetModules();
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
  });

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
    test('should compress with some options', function(done) {
      var options = {};
      options.minify = {
        compressor: 'babili',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut,
        options: {
          charset: 'utf8'
        }
      };

      options.minify.callback = function(err, min) {
        expect(err).toBeNull();
        expect(min).not.toBeNull();

        done();
      };

      nodeMinify.minify(options.minify);
    });
  });

  describe('GCC', function() {
    tests.commonjs.forEach(function(o) {
      runOneTest(o, 'gcc');
    });
    tests.commonjs.forEach(function(o) {
      runOneTest(o, 'gcc', true);
    });
    test('should compress with some options', function(done) {
      var options = {};
      options.minify = {
        compressor: 'gcc',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut,
        options: {
          charset: 'utf8'
        }
      };

      options.minify.callback = function(err, min) {
        expect(err).toBeNull();
        expect(min).not.toBeNull();

        done();
      };

      nodeMinify.minify(options.minify);
    });
  });

  describe('GCC Java', function() {
    tests.commonjs.forEach(function(o) {
      runOneTest(o, 'gcc-java');
    });
    tests.commonjs.forEach(function(o) {
      runOneTest(o, 'gcc-java', true);
    });
    test('should compress with some options', function(done) {
      var options = {};
      options.minify = {
        compressor: 'gcc-java',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut,
        options: {
          charset: 'utf8'
        }
      };

      options.minify.callback = function(err, min) {
        expect(err).toBeNull();
        expect(min).not.toBeNull();

        done();
      };

      nodeMinify.minify(options.minify);
    });
  });

  describe('GCC Legacy', function() {
    tests.commonjs.forEach(function(o) {
      runOneTest(o, 'gcc-legacy');
    });
    tests.commonjs.forEach(function(o) {
      runOneTest(o, 'gcc-legacy', true);
    });
    test('should compress with some options', function(done) {
      var options = {};
      options.minify = {
        compressor: 'gcc-legacy',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut,
        options: {
          charset: 'utf8'
        }
      };

      options.minify.callback = function(err, min) {
        expect(err).toBeNull();
        expect(min).not.toBeNull();

        done();
      };

      nodeMinify.minify(options.minify);
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
    test('should compress with some options', function(done) {
      var options = {};
      options.minify = {
        compressor: 'yui-js',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut,
        options: {
          charset: 'utf8'
        }
      };

      options.minify.callback = function(err, min) {
        expect(err).toBeNull();
        expect(min).not.toBeNull();

        done();
      };

      nodeMinify.minify(options.minify);
    });
  });

  describe('UglifyJS', function() {
    tests.commonjs.forEach(function(o) {
      runOneTest(o, 'uglifyjs');
    });
    test('should create a source map', function(done) {
      var options = {};
      options.minify = {
        compressor: 'uglifyjs',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut,
        options: {
          sourceMap: {
            filename: fileJSOut + '.map',
            url: fileJSOut + '.map'
          }
        }
      };

      options.minify.callback = function(err, min) {
        expect(err).toBeNull();
        expect(min).not.toBeNull();

        done();
      };

      nodeMinify.minify(options.minify);
    });
    test('should compress with some options', function(done) {
      var options = {};
      options.minify = {
        compressor: 'uglifyjs',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut,
        options: {
          mangle: false
        }
      };

      options.minify.callback = function(err, min) {
        expect(err).toBeNull();
        expect(min).not.toBeNull();

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

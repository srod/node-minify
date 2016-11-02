/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

import childProcess from 'child_process';
import mkdirp from 'mkdirp';
import { minify } from '../src/node-minify';

const oneFile = __dirname + '/../examples/public/js/sample.js';
const filesArray = [__dirname + '/../examples/public/js/sample.js', __dirname + '/../examples/public/js/sample2.js'];
const filesArrayWithWildcards = ['sample.js', 'sample2.js', '**/*.js'];
const filesArrayWithWildcards2 = [
  __dirname + '/../examples/public/js/sample.js',
  __dirname + '/../examples/public/js/sample2.js',
  __dirname + '/../examples/public/js/**/*.js'
];
const fileJSOut = __dirname + '/../examples/public/dist/sample.js';
const fileCSS = __dirname + '/../examples/public/css/sample.css';
const fileCSSArray = [
  __dirname + '/../examples/public/css/sample.css',
  __dirname + '/../examples/public/css/sample2.css'
];
const fileCSSArrayWithWildcards = ['sample.css', 'sample2.css', '/**/*.css'];
const fileCSSArrayWithWildcards2 = [
  __dirname + '/../examples/public/css/sample.css',
  __dirname + '/../examples/public/css/sample2.css',
  __dirname + '/**/*.css'
];
const fileCSSOut = __dirname + '/../examples/public/dist/sample.css';

const tests = {
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
        input: ['sample.css', 'sample2.css'],
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
      it:
        'should compress css with {compressor} and an array of strings and wildcards path' +
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
        input: ['sample.js', 'sample2.js'],
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
      it:
        'should compress javascript with {compressor} and an array of strings and wildcards path' +
        ' with a custom public folder',
      minify: {
        compressor: '{compressor}',
        input: filesArrayWithWildcards,
        output: fileJSOut,
        publicFolder: __dirname + '/../examples/public/js/'
      }
    }
  ],
  babelMinify: [
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
          presets: ['env']
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
          presets: ['env']
        }
      }
    }
  ],
  butternut: [
    {
      it: 'should compress javascript with {compressor} and a single file with option check',
      minify: {
        compressor: '{compressor}',
        input: oneFile,
        output: fileJSOut,
        options: {
          check: true
        }
      }
    },
    {
      it: 'should compress javascript with {compressor} and a single file with option allowDangerousEval',
      minify: {
        compressor: '{compressor}',
        input: oneFile,
        output: fileJSOut,
        options: {
          allowDangerousEval: true
        }
      }
    },
    {
      it: 'should compress javascript with {compressor} and a single file with option sourceMap',
      minify: {
        compressor: '{compressor}',
        input: oneFile,
        output: fileJSOut,
        options: {
          sourceMap: false
        }
      }
    },
    {
      it: 'should compress javascript with {compressor} and a single file with option sourceMap',
      minify: {
        compressor: '{compressor}',
        input: oneFile,
        output: fileJSOut,
        options: {
          sourceMap: true
        }
      }
    },
    {
      it: 'should compress javascript with {compressor} and a single file with option file',
      minify: {
        compressor: '{compressor}',
        input: oneFile,
        output: fileJSOut,
        options: {
          file: 'file.js'
        }
      }
    },
    {
      it: 'should compress javascript with {compressor} and a single file with option source',
      minify: {
        compressor: '{compressor}',
        input: oneFile,
        output: fileJSOut,
        options: {
          source: 'source.js'
        }
      }
    },
    {
      it: 'should compress javascript with {compressor} and a single file with option includeContent',
      minify: {
        compressor: '{compressor}',
        input: oneFile,
        output: fileJSOut,
        options: {
          includeContent: false
        }
      }
    }
  ]
};

const runOneTest = (options, compressor, sync) => {
  options = JSON.parse(JSON.stringify(options));

  options.minify.compressor = options.minify.compressor.replace('{compressor}', compressor);
  options.minify.output = options.minify.output.replace('{compressor}', compressor);

  if (sync) {
    options.minify.sync = true;
  }

  test(options.it.replace('{compressor}', compressor), () => {
    return new Promise(resolve => {
      options.minify.callback = (err, min) => {
        resolve(err, min);
      };

      minify(options.minify);
    }).then((err, min) => {
      expect(err).toBeNull();
      expect(min).not.toBeNull();
    });
  });
};

describe('node-minify', () => {
  mkdirp('/tmp/');

  describe('Fake binary', () => {
    test('should throw an error if binary does not exist', () => {
      const options = {};
      options.minify = {
        compressor: 'fake',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toEqual('Error: Type "fake" does not exist');
      });
    });
  });

  describe('No mandatories', () => {
    test('should throw an error if no compressor', () => {
      const options = {};
      options.minify = {
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toEqual('Error: compressor is mandatory.');
      });
    });

    test('should throw an error if no input', () => {
      const options = {};
      options.minify = {
        compressor: 'no-compress',
        output: fileJSOut
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toEqual('Error: input is mandatory.');
      });
    });

    test('should throw an error if no output', () => {
      const options = {};
      options.minify = {
        compressor: 'no-compress',
        input: __dirname + '/../examples/public/js/**/*.js'
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toEqual('Error: output is mandatory.');
      });
    });
  });

  describe('Create errors', () => {
    test('should callback an error if gcc with bad options', () => {
      const options = {};
      options.minify = {
        compressor: 'gcc-java',
        input: oneFile,
        output: fileJSOut,
        options: {
          fake: true
        },
        callback: () => {}
      };
      const spy = jest.spyOn(options.minify, 'callback');

      return minify(options.minify).catch(err => {
        expect(spy).toHaveBeenCalled();
        return expect(err.toString()).toMatch('"--fake" is not a valid option');
      });
    });

    test('should callback an error if gcc with bad options and sync', () => {
      const options = {};
      options.minify = {
        compressor: 'gcc-java',
        input: oneFile,
        output: fileJSOut,
        sync: true,
        options: {
          fake: true
        }
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toMatch('"--fake" is not a valid option');
      });
    });

    test('should callback an error if yui with bad options', () => {
      const options = {};
      options.minify = {
        compressor: 'yui-js',
        input: oneFile,
        output: fileJSOut,
        options: {
          fake: true
        }
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toMatch('Usage: java -jar');
      });
    });

    test('should callback an error if yui with bad options and sync', () => {
      const options = {};
      options.minify = {
        compressor: 'yui-js',
        input: oneFile,
        output: fileJSOut,
        sync: true,
        options: {
          fake: true
        }
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toMatch('Usage: java -jar');
      });
    });
  });

  describe('Create sync errors', () => {
    beforeEach(() => {
      spyOn(childProcess, 'spawnSync').and.throwError('UnsupportedClassVersionError');
    });
    test('should callback an error on spawnSync', () => {
      const options = {};
      options.minify = {
        compressor: 'gcc-java',
        input: oneFile,
        output: fileJSOut,
        sync: true
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toEqual(
          'Latest Google Closure Compiler requires Java >= 1.7, please' + ' update Java or use gcc-legacy'
        );
      });
    });
  });

  describe('Create async errors', () => {
    beforeEach(() => {
      spyOn(childProcess, 'spawn').and.throwError('error manual test');
    });
    test('should callback an error on spawn', () => {
      const options = {};
      options.minify = {
        compressor: 'gcc-java',
        input: oneFile,
        output: fileJSOut,
        sync: false,
        callback: () => {}
      };
      const spy = jest.spyOn(options.minify, 'callback');

      return minify(options.minify).catch(err => {
        expect(spy).toHaveBeenCalled();
        return expect(err.toString()).toEqual('Error: error manual test');
      });
    });
  });

  describe('Mandatory', () => {
    test('should show throw on type option', () => {
      const options = {};
      options.minify = {
        type: 'uglifyjs',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut,
        callback: () => {}
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toEqual('Error: compressor is mandatory.');
      });
    });
  });

  describe('use_strict', () => {
    let originalExecArgv;
    beforeEach(() => {
      originalExecArgv = JSON.parse(JSON.stringify(process.execArgv));
      process.execArgv.push('--use_strict');
    });
    afterEach(() => {
      process.execArgv = originalExecArgv;
    });
    test('should not throw with --use_strict flag', done => {
      jest.resetModules();
      const nodeMinify = require('../src/node-minify').minify;
      const options = {};
      options.minify = {
        compressor: 'gcc',
        input: __dirname + '/../examples/public/js/sample.js',
        output: fileJSOut
      };

      options.minify.callback = (err, min) => {
        expect(err).toBeNull();
        expect(min).not.toBeNull();
        done();
      };
      nodeMinify(options.minify);
    });
  });

  describe('Concatenation', () => {
    tests.concat.forEach(o => {
      runOneTest(o, 'no-compress');
    });
    tests.concat.forEach(o => {
      runOneTest(o, 'no-compress', true);
    });
  });

  describe('Babel-minify', () => {
    tests.commonjs.forEach(o => {
      runOneTest(o, 'babel-minify');
    });
    tests.babelMinify.forEach(o => {
      runOneTest(o, 'babel-minify');
    });
    tests.commonjs.forEach(o => {
      runOneTest(o, 'babel-minify', true);
    });
    tests.babelMinify.forEach(o => {
      runOneTest(o, 'babel-minify', true);
    });
    test('should compress with some options', done => {
      const options = {};
      options.minify = {
        compressor: 'babel-minify',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut,
        options: {
          charset: 'utf8'
        }
      };

      options.minify.callback = (err, min) => {
        expect(err).toBeNull();
        expect(min).not.toBeNull();

        done();
      };

      minify(options.minify);
    });
  });

  describe('Butternut', () => {
    tests.commonjs.forEach(o => {
      runOneTest(o, 'butternut');
    });
    tests.butternut.forEach(o => {
      runOneTest(o, 'butternut');
    });
    tests.commonjs.forEach(o => {
      runOneTest(o, 'butternut', true);
    });
    tests.butternut.forEach(o => {
      runOneTest(o, 'butternut', true);
    });
  });

  describe('GCC', () => {
    tests.commonjs.forEach(o => {
      runOneTest(o, 'gcc');
    });
    tests.commonjs.forEach(o => {
      runOneTest(o, 'gcc', true);
    });
    test('should compress with some options', done => {
      const options = {};
      options.minify = {
        compressor: 'gcc',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut,
        options: {
          languageIn: 'ECMASCRIPT5',
          createSourceMap: true
        }
      };

      options.minify.callback = (err, min) => {
        expect(err).toBeNull();
        expect(min).not.toBeNull();

        done();
      };

      minify(options.minify);
    });
  });

  describe('GCC Java', () => {
    tests.commonjs.forEach(o => {
      runOneTest(o, 'gcc-java');
    });
    tests.commonjs.forEach(o => {
      runOneTest(o, 'gcc-java', true);
    });
    test('should compress with some options', done => {
      const options = {};
      options.minify = {
        compressor: 'gcc-java',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut,
        options: {
          charset: 'utf8'
        }
      };

      options.minify.callback = (err, min) => {
        expect(err).toBeNull();
        expect(min).not.toBeNull();

        done();
      };

      minify(options.minify);
    });
  });

  describe('GCC Legacy', () => {
    tests.commonjs.forEach(o => {
      runOneTest(o, 'gcc-legacy');
    });
    tests.commonjs.forEach(o => {
      runOneTest(o, 'gcc-legacy', true);
    });
    test('should compress with some options', done => {
      const options = {};
      options.minify = {
        compressor: 'gcc-legacy',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut,
        options: {
          charset: 'utf8'
        }
      };

      options.minify.callback = (err, min) => {
        expect(err).toBeNull();
        expect(min).not.toBeNull();

        done();
      };

      minify(options.minify);
    });
  });

  describe('YUI', () => {
    tests.commonjs.forEach(o => {
      runOneTest(o, 'yui-js');
    });
    tests.commonjs.forEach(o => {
      runOneTest(o, 'yui-js', true);
    });

    tests.commoncss.forEach(o => {
      runOneTest(o, 'yui-css');
    });
    tests.commoncss.forEach(o => {
      runOneTest(o, 'yui', true);
    });
    test('should compress with some options', done => {
      const options = {};
      options.minify = {
        compressor: 'yui-js',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut,
        options: {
          charset: 'utf8'
        }
      };

      options.minify.callback = (err, min) => {
        expect(err).toBeNull();
        expect(min).not.toBeNull();

        done();
      };

      minify(options.minify);
    });
  });

  describe('UglifyJS', () => {
    tests.commonjs.forEach(o => {
      runOneTest(o, 'uglifyjs');
    });
    tests.commonjs.forEach(o => {
      runOneTest(o, 'uglifyjs', true);
    });
    test('should create a source map', done => {
      const options = {};
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

      options.minify.callback = (err, min) => {
        expect(err).toBeNull();
        expect(min).not.toBeNull();

        done();
      };

      minify(options.minify);
    });
    test('should compress with some options', done => {
      const options = {};
      options.minify = {
        compressor: 'uglifyjs',
        input: __dirname + '/../examples/public/js/**/*.js',
        output: fileJSOut,
        options: {
          mangle: false
        }
      };

      options.minify.callback = (err, min) => {
        expect(err).toBeNull();
        expect(min).not.toBeNull();

        done();
      };

      minify(options.minify);
    });
  });

  describe('Clean-css', () => {
    tests.commoncss.forEach(o => {
      runOneTest(o, 'clean-css');
    });
    tests.commoncss.forEach(o => {
      runOneTest(o, 'clean-css', true);
    });
  });

  describe('CSSO', () => {
    tests.commoncss.forEach(o => {
      runOneTest(o, 'csso');
    });
    tests.commoncss.forEach(o => {
      runOneTest(o, 'csso', true);
    });
  });

  describe('Sqwish', () => {
    tests.commoncss.forEach(o => {
      runOneTest(o, 'sqwish');
    });
    tests.commoncss.forEach(o => {
      runOneTest(o, 'sqwish', true);
    });
  });

  describe('Crass', function() {
    tests.commoncss.forEach(function(o) {
      runOneTest(o, 'crass');
    });
    tests.commoncss.forEach(function(o) {
      runOneTest(o, 'crass', true);
    });
  });
});

/*!
 * node-minify
 * Copyright(c) 2011-2021 Rodolphe Stoclin
 * MIT Licensed
 */

import childProcess from 'child_process';
import minify from '../../core/src/core';
import gcc from '../../google-closure-compiler/src/google-closure-compiler';
import noCompress from '../../no-compress/src/no-compress';
import yui from '../../yui/src/yui';
import uglifyes from '../../uglify-es/src/uglify-es';
import htmlMinifier from '../../html-minifier/src/html-minifier';
import { filesJS } from '../../../tests/files-path';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'uglify-es';
const compressor = uglifyes;

describe('Package: core', () => {
  tests.commonjs.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commonjs.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
  describe('Fake binary', () => {
    test('should throw an error if binary does not exist', () => {
      const options = {};
      options.minify = {
        compressor: 'fake',
        input: filesJS.oneFileWithWildcards,
        output: filesJS.fileJSOut
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toEqual(
          'Error: compressor should be a function, maybe you forgot to install the compressor'
        );
      });
    });
  });

  describe('No mandatories', () => {
    test('should throw an error if no compressor', () => {
      const options = {};
      options.minify = {
        input: filesJS.oneFileWithWildcards,
        output: filesJS.fileJSOut
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toEqual('Error: compressor is mandatory.');
      });
    });

    test('should throw an error if no input', () => {
      const options = {};
      options.minify = {
        compressor: noCompress,
        output: filesJS.fileJSOut
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toEqual('Error: input is mandatory.');
      });
    });

    test('should throw an error if no output', () => {
      const options = {};
      options.minify = {
        compressor: noCompress,
        input: filesJS.oneFileWithWildcards
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toEqual('Error: output is mandatory.');
      });
    });
  });

  describe('Create errors', () => {
    test('should catch an error if gcc with bad options', () => {
      const options = {};
      options.minify = {
        compressor: gcc,
        input: filesJS.oneFile,
        output: filesJS.fileJSOut,
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

    test('should catch an error if gcc with bad options and sync', () => {
      const options = {};
      options.minify = {
        compressor: gcc,
        input: filesJS.oneFile,
        output: filesJS.fileJSOut,
        sync: true,
        options: {
          fake: true
        }
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toMatch('"--fake" is not a valid option');
      });
    });

    test('should catch an error if yui with bad options', () => {
      const options = {};
      options.minify = {
        compressor: yui,
        type: 'js',
        input: filesJS.oneFile,
        output: filesJS.fileJSOut,
        options: {
          fake: true
        }
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toMatch('Error');
      });
    });

    test('should catch an error if yui with bad options and sync', () => {
      const options = {};
      options.minify = {
        compressor: yui,
        type: 'js',
        input: filesJS.oneFile,
        output: filesJS.fileJSOut,
        sync: true,
        options: {
          fake: true
        }
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toMatch('Error');
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
        compressor: yui,
        input: filesJS.oneFile,
        output: filesJS.fileJSOut,
        sync: true,
        options: {
          fake: true
        }
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toEqual('Error: UnsupportedClassVersionError');
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
        compressor: yui,
        input: filesJS.oneFile,
        output: filesJS.fileJSOut,
        sync: false,
        options: {
          fake: true
        },
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
        input: filesJS.oneFileWithWildcards,
        output: filesJS.fileJSOut,
        callback: () => {}
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toEqual('Error: compressor is mandatory.');
      });
    });
  });

  describe('Should be OK', () => {
    test('should be OK with GCC and async', () => {
      const options = {};
      options.minify = {
        compressor: gcc,
        input: filesJS.oneFile,
        output: filesJS.fileJSOut,
        callback: () => {}
      };
      const spy = jest.spyOn(options.minify, 'callback');

      return minify(options.minify).then(min => {
        expect(spy).toHaveBeenCalled();
        return expect(min).toBeDefined();
      });
    });

    test('should be OK with GCC and sync', () => {
      const options = {};
      options.minify = {
        compressor: gcc,
        input: filesJS.oneFile,
        output: filesJS.fileJSOut,
        sync: true,
        callback: () => {}
      };
      const spy = jest.spyOn(options.minify, 'callback');

      return minify(options.minify).then(min => {
        expect(spy).toHaveBeenCalled();
        return expect(min).toBeDefined();
      });
    });
  });

  describe('In Memory', () => {
    test('should be OK with html minifier and async', () => {
      const options = {};
      options.minify = {
        compressor: htmlMinifier,
        content: '<html><body><div>content</div></body></html>',
        callback: () => {}
      };
      const spy = jest.spyOn(options.minify, 'callback');

      return minify(options.minify).then(min => {
        expect(spy).toHaveBeenCalled();
        return expect(min).toBeDefined();
      });
    });

    test('should be OK with GCC and sync', () => {
      const options = {};
      options.minify = {
        compressor: htmlMinifier,
        content: '<html><body><div>content</div></body></html>',
        sync: true,
        callback: () => {}
      };
      const spy = jest.spyOn(options.minify, 'callback');

      return minify(options.minify).then(min => {
        expect(spy).toHaveBeenCalled();
        return expect(min).toBeDefined();
      });
    });

    test('should throw an error if binary does not exist', () => {
      const options = {};
      options.minify = {
        compressor: 'fake',
        content: '<html><body><div>content</div></body></html>'
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toEqual(
          'Error: compressor should be a function, maybe you forgot to install the compressor'
        );
      });
    });
  });
});

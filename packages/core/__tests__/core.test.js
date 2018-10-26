/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

import childProcess from 'child_process';
import { minify } from '@node-minify/core';
import gcc from '@node-minify/google-closure-compiler';
import noCompress from '@node-minify/no-compress';
import yui from '@node-minify/yui';
import { filesJS } from '../../../tests/files-path';

describe('core', () => {
  describe('Fake binary', () => {
    test('should throw an error if binary does not exist', () => {
      const options = {};
      options.minify = {
        compressor: 'fake',
        input: filesJS.oneFileWithWildcards,
        output: filesJS.fileJSOut
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
    test('should callback an error if gcc with bad options', () => {
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

    test('should callback an error if gcc with bad options and sync', () => {
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

    test('should callback an error if yui with bad options', () => {
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
        return expect(err.toString()).toMatch('Usage: java -jar');
      });
    });

    test('should callback an error if yui with bad options and sync', () => {
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
});

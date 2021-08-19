/*!
 * node-minify
 * Copyright(c) 2011-2021 Rodolphe Stoclin
 * MIT Licensed
 */

import childProcess from 'child_process';
import minify from '../../core/src/core';
import yui from '../../yui/src/yui';
import { filesJS } from '../../../tests/files-path';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'yui';
const compressor = yui;

describe('Package: YUI', () => {
  tests.commonjs.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commonjs.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
  test('should compress with some options', done => {
    const options = {};
    options.minify = {
      compressor: yui,
      input: filesJS.oneFileWithWildcards,
      output: filesJS.fileJSOut,
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

  describe('Create sync errors', () => {
    beforeAll(() => {
      let spy = jest.spyOn(childProcess, 'spawnSync');
      spy.mockImplementation(() => {
        throw new Error();
      });
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
      return expect(minify(options.minify)).rejects.toThrow();
    });
    afterAll(() => {
      jest.restoreAllMocks();
    });
  });

  describe('Create async errors', () => {
    beforeAll(() => {
      let spy = jest.spyOn(childProcess, 'spawn');
      spy.mockImplementation(() => {
        throw new Error();
      });
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
      expect(minify(options.minify)).rejects.toThrow();
      return minify(options.minify).catch(() => expect(spy).toHaveBeenCalled());
    });
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });
});

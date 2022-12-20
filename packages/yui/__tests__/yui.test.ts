/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import childProcess from 'child_process';
import minify from '../../core/src';
import yui from '../src';
import { filesJS } from '../../../tests/files-path';
import { runOneTest, tests } from '../../../tests/fixtures';
import { TESTS_TIMEOUT } from '../../../tests/constants';
import { Options } from '../../../tests/types';

const compressorLabel = 'yui';
const compressor = yui;

describe(
  'Package: YUI',
  () => {
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
    test('should compress with some options', (): Promise<void> =>
      new Promise<void>(done => {
        // const options: { minify: { callback?: Function } } = {};
        const options: Options = {
          minify: {
            compressor: yui,
            input: filesJS.oneFileWithWildcards,
            output: filesJS.fileJSOut,
            options: {
              charset: 'utf8'
            }
          }
        };

        options.minify.callback = (err, min) => {
          expect(err).toBeNull();
          expect(min).not.toBeNull();

          done();
        };

        minify(options.minify);
      }));

    test('should catch an error if yui with bad options', () => {
      const options: Options = {
        minify: {
          compressor: yui,
          type: 'js',
          input: filesJS.oneFile,
          output: filesJS.fileJSOut,
          options: {
            fake: true
          }
        }
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toMatch('Error');
      });
    });

    describe('Create sync errors', () => {
      beforeAll(() => {
        const spy = vi.spyOn(childProcess, 'spawnSync');
        spy.mockImplementation(() => {
          throw new Error();
        });
      });
      test('should callback an error on spawnSync', () => {
        const options: Options = {
          minify: {
            compressor: yui,
            input: filesJS.oneFile,
            output: filesJS.fileJSOut,
            sync: true,
            options: {
              fake: true
            }
          }
        };
        return expect(minify(options.minify)).rejects.toThrow();
      });
      afterAll(() => {
        vi.restoreAllMocks();
      });
    });

    describe('Create async errors', () => {
      beforeAll(() => {
        const spy = vi.spyOn(childProcess, 'spawn');
        spy.mockImplementation(() => {
          throw new Error();
        });
      });
      test('should callback an error on spawn', (): Promise<void> =>
        new Promise<void>(done => {
          const options: Options = {
            minify: {
              compressor: yui,
              input: filesJS.oneFile,
              output: filesJS.fileJSOut,
              sync: false,
              options: {
                fake: true
              },
              callback: (): void => {
                return;
              }
            }
          };
          const spy = vi.spyOn(options.minify, 'callback');
          expect(minify(options.minify)).rejects.toThrow();
          done();
          return minify(options.minify).catch(() => expect(spy).toHaveBeenCalled());
        }));
    });
    afterAll(() => {
      vi.restoreAllMocks();
    });
  },
  TESTS_TIMEOUT
);

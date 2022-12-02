/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import minify from '../../core/src';
import gcc from '../src';
import { filesJS } from '../../../tests/files-path';
import { runOneTest, tests } from '../../../tests/fixtures';
import { TESTS_TIMEOUT } from '../../../constants';

const compressorLabel = 'google-closure-compiler';
const compressor = gcc;

describe(
  'Package: google-closure-compiler',
  () => {
    tests.commonjs.forEach(options => {
      runOneTest({ options, compressorLabel, compressor });
    });
    tests.commonjs.forEach(options => {
      runOneTest({ options, compressorLabel, compressor, sync: true });
    });
    test('should compress with some options', () =>
      new Promise(done => {
        const options = {};
        options.minify = {
          compressor: gcc,
          input: filesJS.oneFileWithWildcards,
          output: filesJS.fileJSOut,
          options: {
            language_in: 'ECMASCRIPT5'
          }
        };

        options.minify.callback = (err, min) => {
          expect(err).toBeNull();
          expect(min).not.toBeNull();

          done();
        };

        minify(options.minify);
      }));
    test('should throw an error', () => {
      const options = {};
      options.minify = {
        compressor: gcc,
        input: filesJS.errors,
        output: filesJS.fileJSOut
      };

      return minify(options.minify).catch(err => {
        return expect(err).not.toBeNull();
      });
    });
  },
  TESTS_TIMEOUT
);

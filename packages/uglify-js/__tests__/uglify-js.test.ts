/*!
 * node-minify
 * Copyright(c) 2011-2023 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe, expect, test } from 'vitest';
import minify from '../../core/src';
import uglifyjs from '../src';
import { filesJS } from '../../../tests/files-path';
import { runOneTest, tests } from '../../../tests/fixtures';
import { Options } from '../../../tests/types';

const compressorLabel = 'uglify-js';
const compressor = uglifyjs;

describe('Package: uglify-js', () => {
  tests.commonjs.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.uglifyjs.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commonjs.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
  tests.uglifyjs.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
  test('should throw an error', () => {
    const options: Options = {
      minify: {
        compressor: uglifyjs,
        input: filesJS.errors,
        output: filesJS.fileJSOut
      }
    };

    return minify(options.minify).catch(err => {
      return expect(err).not.toBeNull();
    });
  });
});

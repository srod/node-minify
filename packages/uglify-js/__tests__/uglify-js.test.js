/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

import { minify } from '@node-minify/core';
import uglifyjs from '@node-minify/uglify-js';
import { filesJS } from '../../../tests/files-path';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'uglify-js';
const compressor = uglifyjs;

describe('uglify-js', () => {
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
    const options = {};
    options.minify = {
      compressor: uglifyjs,
      input: filesJS.errors,
      output: filesJS.fileJSOut
    };

    return minify(options.minify).catch(err => {
      return expect(err).not.toBeNull();
    });
  });
});

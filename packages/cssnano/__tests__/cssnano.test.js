/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

import minify from '../../core/src/core';
import cssnano from '../src/cssnano';
import { filesCSS } from '../../../tests/files-path';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'cssnano';
const compressor = cssnano;

describe('Package: cssnano', () => {
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
  test('should be ok with no callback', () => {
    const options = {};
    options.minify = {
      compressor: cssnano,
      input: filesCSS.fileCSS,
      output: filesCSS.fileCSSOut
    };

    return minify(options.minify).then(min => {
      return expect(min).not.toBeNull();
    });
  });
  test('should throw an error', () => {
    const options = {};
    options.minify = {
      compressor: cssnano,
      input: filesCSS.fileCSSErrors,
      output: filesCSS.fileCSSOut,
      callback: () => {}
    };

    return minify(options.minify).catch(err => {
      return expect(err).not.toBeNull();
    });
  });
});

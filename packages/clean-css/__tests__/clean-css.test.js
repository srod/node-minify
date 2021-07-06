/*!
 * node-minify
 * Copyright(c) 2011-2021 Rodolphe Stoclin
 * MIT Licensed
 */

import minify from '../../core/src/core';
import cleanCss from '../src/clean-css';
import { filesCSS } from '../../../tests/files-path';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'clean-css';
const compressor = cleanCss;

describe('Package: clean-css', () => {
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
  test('should compress with some options', done => {
    const options = {};
    options.minify = {
      compressor,
      input: filesCSS.fileCSS,
      output: filesCSS.fileCSSOut,
      options: {
        sourceMap: {
          filename: filesCSS.fileCSSSourceMaps,
          url: filesCSS.fileCSSSourceMaps
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
});

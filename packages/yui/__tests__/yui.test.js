/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

import { minify } from '@node-minify/core';
import yui from '@node-minify/yui';
import { filesJS } from '../../../tests/files-path';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'yui';
const compressor = yui;

describe('YUI', () => {
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
});

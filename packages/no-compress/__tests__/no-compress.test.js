/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

import noCompress from '@node-minify/no-compress';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'no-compress';
const compressor = noCompress;

describe('no-compress', () => {
  tests.concat.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.concat.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
});

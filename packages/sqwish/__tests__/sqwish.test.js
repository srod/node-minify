/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

import sqwish from '@node-minify/sqwish';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'sqwish';
const compressor = sqwish;

describe('sqwish', () => {
  tests.commonjs.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commonjs.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
});

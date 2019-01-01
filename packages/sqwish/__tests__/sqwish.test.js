/*!
 * node-minify
 * Copyright(c) 2011-2019 Rodolphe Stoclin
 * MIT Licensed
 */

import sqwish from '../../sqwish/src/sqwish';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'sqwish';
const compressor = sqwish;

describe('Package: sqwish', () => {
  tests.commonjs.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commonjs.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
});

/*!
 * node-minify
 * Copyright(c) 2011-2021 Rodolphe Stoclin
 * MIT Licensed
 */

import noCompress from '../../no-compress/src/no-compress';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'no-compress';
const compressor = noCompress;

describe('Package: no-compress', () => {
  tests.concat.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.concat.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
});

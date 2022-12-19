/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from 'vitest';
import noCompress from '../src';
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

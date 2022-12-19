/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from 'vitest';
import crass from '../src';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'crass';
const compressor = crass;

describe('Package: crass', () => {
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
});

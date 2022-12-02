/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from 'vitest';
import jsonminify from '../src';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'jsonminify';
const compressor = jsonminify;

describe('Package: jsonminify', () => {
  tests.commonjson.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commonjson.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
});

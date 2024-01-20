/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from 'vitest';
import htmlMinifier from '../src';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'html-minifier';
const compressor = htmlMinifier;

describe('Package: html-minifier', () => {
  tests.commonhtml.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commonhtml.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
});

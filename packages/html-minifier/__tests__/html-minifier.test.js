/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

import htmlMinifier from '@node-minify/html-minifier';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'html-minifier';
const compressor = htmlMinifier;

describe('html-minifier', () => {
  tests.commonhtml.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commonhtml.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
});

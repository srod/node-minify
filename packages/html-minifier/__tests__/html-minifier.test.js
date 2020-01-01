/*!
 * node-minify
 * Copyright(c) 2011-2020 Rodolphe Stoclin
 * MIT Licensed
 */

import htmlMinifier from '../../html-minifier/src/html-minifier';
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

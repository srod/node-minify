/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

import cleanCss from '@node-minify/clean-css';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'clean-css';
const compressor = cleanCss;

describe('clean-css', () => {
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
});

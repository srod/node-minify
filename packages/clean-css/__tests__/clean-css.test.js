/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

import cleanCss from '../src/clean-css';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'clean-css';
const compressor = cleanCss;

describe('Package: clean-css', () => {
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
});

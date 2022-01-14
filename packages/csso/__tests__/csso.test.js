/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

import csso from '../../csso/src/csso';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'csso';
const compressor = csso;

describe('Package: csso', () => {
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
});

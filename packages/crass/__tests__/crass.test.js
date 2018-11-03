/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

import crass from '@node-minify/crass';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'crass';
const compressor = crass;

describe('crass', () => {
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
});

/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from 'vitest';
import sqwish from '../src';
import { runOneTest, tests } from '../../../tests/fixtures';
// import { Options } from '../../../tests/types';

// export interface Result {
//   compressor?: string | Function;
//   compressorLabel: string | Function;
//   options: {};
// }

const compressorLabel = 'sqwish';
const compressor = sqwish;

describe('Package: sqwish', () => {
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
});

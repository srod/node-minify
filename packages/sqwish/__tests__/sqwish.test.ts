/*!
 * node-minify
 * Copyright(c) 2011-2023 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from 'vitest';
// import { Options } from '@node-minify/types';
import sqwish from '../src';
import { runOneTest, tests } from '../../../tests/fixtures';

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

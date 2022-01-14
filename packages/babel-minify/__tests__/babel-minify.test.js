/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

import babelMinify from '../src/babel-minify';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'babel-minify';
const compressor = babelMinify;

describe('Package: babel-minify', () => {
  tests.commonjs.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.babelMinify.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commonjs.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
  tests.babelMinify.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
});

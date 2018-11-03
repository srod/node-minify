/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

import babelMinify from '@node-minify/babel-minify';
import { runOneTest, tests } from '../../../tests/fixtures';

const compressorLabel = 'babel-minify';
const compressor = babelMinify;

describe('babel-minify', () => {
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

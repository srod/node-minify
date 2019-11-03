/*!
 * node-minify
 * Copyright(c) 2011-2019 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import { utils } from '@node-minify/utils';

/**
 * Run compressor.
 *
 * @param {Object} settings
 */
const compressInMemory = settings => {
  if (typeof settings.compressor !== 'function') {
    throw new Error(`compressor should be a function, maybe you forgot to install the compressor`);
  }

  return utils.compressSingleFile(settings);
};

/**
 * Expose `compress()`.
 */
export { compressInMemory };

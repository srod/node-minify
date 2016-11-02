/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import sqwish from 'sqwish';
import { utils } from '../utils';

/**
 * Run sqwish.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */

const compressSqwish = (settings, content, callback) => {
  const contentMinified = sqwish.minify(content, settings.options.strict);
  utils.writeFile(settings.output, contentMinified);
  if (callback) {
    return callback(null, contentMinified);
  }
  return contentMinified;
};

/**
 * Expose `compressSqwish()`.
 */

export { compressSqwish };

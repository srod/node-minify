/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import { utils } from '../utils';

/**
 * Just merge, no compression.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */

const noCompress = (settings, content, callback) => {
  utils.writeFile(settings.output, content);
  if (callback) {
    return callback(null, content);
  }
  return content;
};

/**
 * Expose `noCompress()`.
 */

export { noCompress };

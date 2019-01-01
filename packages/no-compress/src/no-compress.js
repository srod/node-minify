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
 * Just merge, no compression.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const noCompress = ({ settings, content, callback, index }) => {
  utils.writeFile({ file: settings.output, content, index });
  if (callback) {
    return callback(null, content);
  }
  return content;
};

/**
 * Expose `noCompress()`.
 */
module.exports = noCompress;

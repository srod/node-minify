/*!
 * node-minify
 * Copyright(c) 2011-2020 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import sqwish from 'sqwish';
import { utils } from '@node-minify/utils';

/**
 * Run sqwish.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifySqwish = ({ settings, content, callback, index }) => {
  const contentMinified = sqwish.minify(content, settings.options.strict);
  if (!settings.content) {
    utils.writeFile({ file: settings.output, content: contentMinified, index });
  }
  if (callback) {
    return callback(null, contentMinified);
  }
  return contentMinified;
};

/**
 * Expose `minifySqwish()`.
 */
module.exports = minifySqwish;

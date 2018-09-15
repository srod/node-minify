/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var utils = require('../utils');

/**
 * Expose `noCompress()`.
 */

module.exports = noCompress;

/**
 * Just merge, no compression.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */

function noCompress(settings, content, callback, index) {
  utils.writeFile(settings.output, content, index);
  if (callback) {
    return callback(null, content);
  }
  return content;
}

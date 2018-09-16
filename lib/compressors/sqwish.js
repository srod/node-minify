/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var sqwish = require('sqwish');
var utils = require('../utils');

/**
 * Expose `compressSqwish()`.
 */

module.exports = compressSqwish;

/**
 * Run sqwish.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */

function compressSqwish(settings, content, callback, index) {
  var contentMinified = sqwish.minify(content, settings.options.strict);
  utils.writeFile(settings.output, contentMinified, index);
  if (callback) {
    return callback(null, contentMinified);
  }
  return contentMinified;
}

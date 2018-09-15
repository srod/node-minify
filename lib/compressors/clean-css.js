/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var CleanCSS = require('clean-css');
var utils = require('../utils');

/**
 * Expose `compressCleanCSS()`.
 */

module.exports = compressCleanCSS;

/**
 * Run clean-css.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */

function compressCleanCSS(settings, content, callback, index) {
  var contentMinified = new CleanCSS(settings.options).minify(content).styles;
  utils.writeFile(settings.output, contentMinified, index);
  if (callback) {
    return callback(null, contentMinified);
  }
  return contentMinified;
}

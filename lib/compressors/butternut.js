/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var butternut = require('butternut');
var utils = require('../utils');

/**
 * Expose `compressButternut()`.
 */

module.exports = compressButternut;

/**
 * Run butternut.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */

function compressButternut(settings, content, callback, index) {
  var contentMinified = butternut.squash(content, settings.options);
  if (contentMinified.map && settings.options.sourceMap) {
    utils.writeFile(settings.output + '.map', contentMinified.map, index);
  }
  utils.writeFile(settings.output, contentMinified.code, index);
  if (callback) {
    return callback(null, contentMinified.code);
  }
  return contentMinified.code;
}

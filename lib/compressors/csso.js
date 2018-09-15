/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var csso = require('csso');
var utils = require('../utils');

/**
 * Expose `compressCSSO()`.
 */

module.exports = compressCSSO;

/**
 * Run csso.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */

function compressCSSO(settings, content, callback, index) {
  var contentMinified = csso.minify(content, settings.options.restructureOff);
  utils.writeFile(settings.output, contentMinified.css, index);
  if (callback) {
    return callback(null, contentMinified.css);
  }
  return contentMinified.css;
}

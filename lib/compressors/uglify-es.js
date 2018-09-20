/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var uglifyES = require('uglify-es');
var utils = require('../utils');

/**
 * Expose `compressUglifyES()`.
 */

module.exports = compressUglifyES;

/**
 * Run uglifyES.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */

function compressUglifyES(settings, content, callback, index) {
  var contentMinified = uglifyES.minify(content, settings.options);
  if (contentMinified.error) {
    if (callback) {
      return callback(contentMinified.error);
    }
  }
  if (contentMinified.map && settings.options.sourceMap) {
    utils.writeFile(settings.options.sourceMap.url, contentMinified.map, index);
  }
  utils.writeFile(settings.output, contentMinified.code, index);
  if (callback) {
    return callback(null, contentMinified.code);
  }
  return contentMinified.code;
}

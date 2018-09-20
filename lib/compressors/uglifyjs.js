/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var uglifyJS = require('uglify-js');
var utils = require('../utils');

/**
 * Expose `compressUglifyJS()`.
 */

module.exports = compressUglifyJS;

/**
 * Run uglifyJS.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */

function compressUglifyJS(settings, content, callback, index) {
  var contentMinified = uglifyJS.minify(content, settings.options);
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

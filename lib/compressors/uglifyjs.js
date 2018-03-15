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

function compressUglifyJS(settings, content, callback) {
  var contentMinified = uglifyJS.minify(content, settings.options);
  if (contentMinified.map && settings.options.sourceMap) {
    utils.writeFile(settings.options.sourceMap.url, contentMinified.map);
  }
  utils.writeFile(settings.output, contentMinified.code);
  if (callback) {
    return callback(null, contentMinified.code);
  }
  return contentMinified.code;
}

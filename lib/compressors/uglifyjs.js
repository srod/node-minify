/*!
 * node-minify
 * Copyright(c) 2011-2017 Rodolphe Stoclin
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
 */

function compressUglifyJS(settings, content) {
  return new Promise(function(resolve) {
    var contentMinified = uglifyJS.minify(content, settings.options);
    utils.writeFile(settings.output, contentMinified.code);
    if (contentMinified.map && settings.options.sourceMap) {
      utils.writeFile(settings.options.sourceMap.url, contentMinified.map);
    }
    resolve(contentMinified.code);
  });
}

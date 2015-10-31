/*!
 * node-minify
 * Copyright(c) 2011-2016 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');
var uglifyJS = require('uglify-js');

/**
 * Expose `compressUglifyJS()`.
 */

module.exports = compressUglifyJS;

/**
 * Run uglifyJS.
 *
 * @param {Object} settings
 * @param {Function} callbackEnd
 */

function compressUglifyJS(settings, callbackEnd) {
  var result = uglifyJS.minify(settings.fileIn);
  fs.writeFileSync(settings.fileOut, result.code, 'utf8');
  callbackEnd(null, settings);
}

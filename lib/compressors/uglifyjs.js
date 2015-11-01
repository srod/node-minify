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
 * @param {String} data
 * @param {Function} callbackEnd
 */

function compressUglifyJS(settings, data, callbackEnd) {
  var options = settings.options;
  options.fromString = true;
  var result = uglifyJS.minify(data, options);
  fs.writeFileSync(settings.fileOut, result.code, 'utf8');
  callbackEnd(null, settings, result.code);
}

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
var CleanCSS = require('clean-css');

/**
 * Expose `compressCleanCSS()`.
 */

module.exports = compressCleanCSS;

/**
 * Run clean-css.
 *
 * @param {Object} settings
 * @param {String} data
 * @param {Function} callbackEnd
 */

function compressCleanCSS(settings, data, callbackEnd) {
  var result = new CleanCSS(settings.options).minify(data).styles;
  fs.writeFileSync(settings.fileOut, result, 'utf8');
  callbackEnd(null, settings, result);
}

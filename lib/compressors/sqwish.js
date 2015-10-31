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
var sqwish = require('sqwish');

/**
 * Expose `compressSqwish()`.
 */

module.exports = compressSqwish;

/**
 * Run sqwish.
 *
 * @param {Object} settings
 * @param {Function} callbackEnd
 */

function compressSqwish(settings, callbackEnd) {
  var result = sqwish.minify(fs.readFileSync(settings.fileIn, 'utf8'));
  fs.writeFileSync(settings.fileOut, result, 'utf8');
  callbackEnd(null, settings);
}

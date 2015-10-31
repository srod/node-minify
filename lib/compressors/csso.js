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
var csso = require('csso');

/**
 * Expose `compressCSSO()`.
 */

module.exports = compressCSSO;

/**
 * Run csso.
 *
 * @param {Object} settings
 * @param {Function} callbackEnd
 */

function compressCSSO(settings, callbackEnd) {
  var result = csso.minify(fs.readFileSync(settings.fileIn, 'utf8'));
  fs.writeFileSync(settings.fileOut, result, 'utf8');
  callbackEnd(null, settings);
}

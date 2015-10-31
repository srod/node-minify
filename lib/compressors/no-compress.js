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

/**
 * Expose `noCompress()`.
 */

module.exports = noCompress;

/**
 * Just merge, no compression.
 *
 * @param {Object} settings
 * @param {Function} callbackEnd
 */

function noCompress(settings, callbackEnd) {
  var fileIn = fs.readFileSync(settings.fileIn);
  fs.writeFileSync(settings.fileOut, fileIn);
  callbackEnd(null, settings);
}

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
 * @param {String} data
 * @param {Function} callbackEnd
 */

function noCompress(settings, data, callbackEnd) {
  fs.writeFileSync(settings.fileOut, data);
  callbackEnd(null, settings, data);
}

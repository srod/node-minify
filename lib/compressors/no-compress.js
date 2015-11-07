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
var Promise = require('bluebird');

/**
 * Expose `noCompress()`.
 */

module.exports = noCompress;

/**
 * Just merge, no compression.
 *
 * @param {Object} settings
 * @param {String} data
 */

function noCompress(settings, data) {
  return new Promise(function(resolve) {
    fs.writeFileSync(settings.fileOut, data);
    resolve(data);
  });
}

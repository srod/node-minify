/*!
 * node-minify
 * Copyright(c) 2011-2016 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var Promise = require('bluebird');
var utils = require('../utils');

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
    utils.writeFile(settings.fileOut, data);
    resolve(data);
  });
}

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
var sqwish = require('sqwish');
var utils = require('../utils');

/**
 * Expose `compressSqwish()`.
 */

module.exports = compressSqwish;

/**
 * Run sqwish.
 *
 * @param {Object} settings
 * @param {String} data
 */

function compressSqwish(settings, data) {
  return new Promise(function(resolve) {
    var result = sqwish.minify(data, settings.options.strict);
    utils.writeFile(settings.fileOut, result);
    resolve(result);
  });
}

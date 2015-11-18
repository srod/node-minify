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
var CleanCSS = require('clean-css');
var utils = require('../utils');

/**
 * Expose `compressCleanCSS()`.
 */

module.exports = compressCleanCSS;

/**
 * Run clean-css.
 *
 * @param {Object} settings
 * @param {String} data
 */

function compressCleanCSS(settings, data) {
  return new Promise(function(resolve) {
    var result = new CleanCSS(settings.options).minify(data).styles;
    utils.writeFile(settings.output, result);
    resolve(result);
  });
}

/*!
 * node-minify
 * Copyright(c) 2011-2017 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

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
 * @param {String} content
 */

function compressSqwish(settings, content) {
  return new Promise(function(resolve) {
    var contentMinified = sqwish.minify(content, settings.options.strict);
    utils.writeFile(settings.output, contentMinified);
    resolve(contentMinified);
  });
}

/*!
 * node-minify
 * Copyright(c) 2011-2017 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

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
 * @param {String} content
 */

function compressCleanCSS(settings, content) {
  return new Promise(function(resolve) {
    var contentMinified = new CleanCSS(settings.options).minify(content).styles;
    utils.writeFile(settings.output, contentMinified);
    resolve(contentMinified);
  });
}

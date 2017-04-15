/*!
 * node-minify
 * Copyright(c) 2011-2017 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var csso = require('csso');
var utils = require('../utils');

/**
 * Expose `compressCSSO()`.
 */

module.exports = compressCSSO;

/**
 * Run csso.
 *
 * @param {Object} settings
 * @param {String} content
 */

function compressCSSO(settings, content) {
  return new Promise(function(resolve) {
    var contentMinified = csso.minify(content, settings.options.restructureOff);
    utils.writeFile(settings.output, contentMinified.css);
    resolve(contentMinified.css);
  });
}

/*!
 * node-minify
 * Copyright(c) 2011-2017 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var utils = require('../utils');

/**
 * Expose `noCompress()`.
 */

module.exports = noCompress;

/**
 * Just merge, no compression.
 *
 * @param {Object} settings
 * @param {String} content
 */

function noCompress(settings, content) {
  return new Promise(function(resolve) {
    utils.writeFile(settings.output, content);
    resolve(content);
  });
}

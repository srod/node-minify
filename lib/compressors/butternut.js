/*!
 * node-minify
 * Copyright(c) 2011-2017 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var butternut = require('butternut');
var utils = require('../utils');

/**
 * Expose `compressButternut()`.
 */

module.exports = compressButternut;

/**
 * Run butternut.
 *
 * @param {Object} settings
 * @param {String} content
 */

function compressButternut(settings, content) {
  return new Promise(function(resolve) {
    var contentMinified = butternut.squash(content, settings.options);
    utils.writeFile(settings.output, contentMinified.code);
    if (contentMinified.map && settings.options.sourceMap) {
      utils.writeFile(settings.output + '.map', contentMinified.map);
    }
    resolve(contentMinified.code);
  });
}

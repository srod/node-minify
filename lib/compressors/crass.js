/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var crass = require('crass');
var utils = require('../utils');

/**
 * Expose `compressCrass()`.
 */

module.exports = compressCrass;

/**
 * Run crass.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */

function compressCrass(settings, content, callback, index) {
  var contentMinified = crass
    .parse(content)
    .optimize()
    .toString();
  utils.writeFile(settings.output, contentMinified, index);
  if (callback) {
    return callback(null, contentMinified);
  }
  return contentMinified;
}

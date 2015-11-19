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
 * @param {String} data
 */

function compressCSSO(settings, data) {
  return new Promise(function(resolve) {
    var result = csso.minify(data, settings.options.restructureOff);
    utils.writeFile(settings.output, result);
    resolve(result);
  });
}

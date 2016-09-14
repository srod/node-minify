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
var babel = require('babel-core');
var utils = require('../utils');

/**
 * Expose `compressBabili()`.
 */

module.exports = compressBabili;

/**
 * Run babili.
 *
 * @param {Object} settings
 * @param {String} content
 */

function compressBabili(settings, content) {
  return new Promise(function(resolve) {
    var contentMinified = babel.transform(content, {presets: ['babili']}); // TODO add settings
    utils.writeFile(settings.output, contentMinified.code);
    resolve(contentMinified.code);
  });
}

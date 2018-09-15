/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var babel = require('babel-core');
var minify = require('babel-preset-minify');
var utils = require('../utils');

/**
 * Expose `compressBabelMinify()`.
 */

module.exports = compressBabelMinify;

/**
 * Run babel-minify.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */

function compressBabelMinify(settings, content, callback, index) {
  var babelOptions = {
    presets: []
  };

  if (settings.options.babelrc) {
    babelOptions = JSON.parse(utils.readFile(settings.options.babelrc));
  }

  if (settings.options.presets) {
    var babelrcPresets = babelOptions.presets || [];
    babelOptions.presets = babelrcPresets.concat(settings.options.presets);
  }

  if (babelOptions.presets.indexOf('minify') === -1) {
    babelOptions.presets = babelOptions.presets.concat([minify]);
  }

  var contentMinified = babel.transform(content, babelOptions);
  utils.writeFile(settings.output, contentMinified.code, index);
  if (callback) {
    return callback(null, contentMinified.code);
  }
  return contentMinified.code;
}

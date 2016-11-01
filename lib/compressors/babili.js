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

    if (babelOptions.presets.indexOf('babili') === -1) {
      babelOptions.presets = babelOptions.presets.concat(['babili']);
    }

    var contentMinified = babel.transform(content, babelOptions);
    utils.writeFile(settings.output, contentMinified.code);
    resolve(contentMinified.code);
  });
}

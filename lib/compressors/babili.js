/*!
 * node-minify
 * Copyright(c) 2011-2017 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var babel = require('babel-core');
var babelPresetBabili = require('babel-preset-babili');
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
      babelOptions.presets = babelOptions.presets.concat([babelPresetBabili]);
    }

    var contentMinified = babel.transform(content, babelOptions);
    utils.writeFile(settings.output, contentMinified.code);
    resolve(contentMinified.code);
  });
}

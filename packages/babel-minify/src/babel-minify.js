/*!
 * node-minify
 * Copyright(c) 2011-2020 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import { transform } from 'babel-core';
import minify from 'babel-preset-minify';
import { utils } from '@node-minify/utils';

/**
 * Run babel-minify.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyBabel = ({ settings, content, callback, index }) => {
  let babelOptions = {
    presets: []
  };

  if (settings.options.babelrc) {
    babelOptions = JSON.parse(utils.readFile(settings.options.babelrc));
  }

  if (settings.options.presets) {
    const babelrcPresets = babelOptions.presets || [];
    babelOptions.presets = babelrcPresets.concat(settings.options.presets);
  }

  if (babelOptions.presets.indexOf('minify') === -1) {
    babelOptions.presets = babelOptions.presets.concat([minify]);
  }

  const contentMinified = transform(content, babelOptions);
  if (!settings.content) {
    utils.writeFile({ file: settings.output, content: contentMinified.code, index });
  }
  if (callback) {
    return callback(null, contentMinified.code);
  }
  return contentMinified.code;
};

/**
 * Expose `minifyBabel()`.
 */
module.exports = minifyBabel;

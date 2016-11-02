/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import { transform } from 'babel-core';
import minify from 'babel-preset-minify';
import { utils } from '../utils';

/**
 * Run babel-minify.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */

const compressBabelMinify = (settings, content, callback) => {
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
  utils.writeFile(settings.output, contentMinified.code);
  if (callback) {
    return callback(null, contentMinified.code);
  }
  return contentMinified.code;
};

/**
 * Expose `compressBabelMinify()`.
 */

export { compressBabelMinify };

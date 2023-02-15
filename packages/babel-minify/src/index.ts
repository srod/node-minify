/*!
 * node-minify
 * Copyright(c) 2011-2023 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import { transform } from 'babel-core';
import minify from 'babel-preset-minify';
import { utils } from '@node-minify/utils';
import { MinifierOptions } from '@node-minify/types';

interface BabelOptions {
  presets: string[];
}

/**
 * Run babel-minify.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyBabel = ({ settings, content, callback, index }: MinifierOptions) => {
  let babelOptions: BabelOptions = {
    presets: []
  };

  if (settings && settings.options && settings.options.babelrc) {
    babelOptions = JSON.parse(utils.readFile(settings.options.babelrc));
  }

  if (settings && settings.options && settings.options.presets) {
    const babelrcPresets = babelOptions.presets || [];
    babelOptions.presets = babelrcPresets.concat(settings.options.presets);
  }

  if (babelOptions.presets.indexOf('minify') === -1) {
    babelOptions.presets = babelOptions.presets.concat([minify]);
  }

  const contentMinified = transform(content || '', babelOptions);
  if (settings && !settings.content && settings.output) {
    settings.output && utils.writeFile({ file: settings.output, content: contentMinified.code, index });
  }
  if (callback) {
    return callback(null, contentMinified.code);
  }
  return contentMinified.code;
};

/**
 * Expose `minifyBabel()`.
 */
minifyBabel.default = minifyBabel;
export = minifyBabel;

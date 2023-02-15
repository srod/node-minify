/*!
 * node-minify
 * Copyright(c) 2011-2023 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import postcss from 'postcss';
import cssnano from 'cssnano';
import { utils } from '@node-minify/utils';
import { MinifierOptions } from '@node-minify/types';

/**
 * Run cssnano.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyCssnano = async ({ settings, content, callback, index }: MinifierOptions) => {
  let contentMinified = { css: '' };
  try {
    contentMinified = await postcss([cssnano]).process(content || '', { from: undefined });
  } catch (e) {
    if (callback) {
      return callback(e);
    }
  }
  if (settings && !settings.content && settings.output) {
    settings.output && utils.writeFile({ file: settings.output, content: contentMinified.css, index });
  }
  if (callback) {
    return callback(null, contentMinified.css);
  }
  return contentMinified.css;
};

/**
 * Expose `minifyCssnano()`.
 */
minifyCssnano.default = minifyCssnano;
export = minifyCssnano;

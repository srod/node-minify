/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import postcss from 'postcss';
import cssnano from 'cssnano';
import { utils } from '@node-minify/utils';
import { MinifierOptions } from '@node-minify/types';

// interface Options {
//   sourceMap?: boolean;
//   _sourceMap?: { url: string } | boolean;
// }

// interface Settings {
//   options: Options;
//   content: string;
//   output: string;
// }

// interface MinifierOptions {
//   settings: Settings;
//   content: string;
//   callback: Function;
//   index: number;
// }

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
  if (settings && !settings.content) {
    utils.writeFile({ file: settings.output, content: contentMinified.css, index });
  }
  if (callback) {
    return callback(null, contentMinified.css);
  }
  return contentMinified.css;
};

/**
 * Expose `minifyCssnano()`.
 */
export default minifyCssnano;

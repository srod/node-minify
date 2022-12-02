/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import { minify } from 'csso';
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
 * Run csso.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyCSSO = ({ settings, content, callback, index }: MinifierOptions) => {
  const contentMinified = minify(content || '', settings && settings.options);
  if (settings && !settings.content) {
    utils.writeFile({ file: settings.output, content: contentMinified.css, index });
  }
  if (callback) {
    return callback(null, contentMinified.css);
  }
  return contentMinified.css;
};

/**
 * Expose `minifyCSSO()`.
 */
export default minifyCSSO;

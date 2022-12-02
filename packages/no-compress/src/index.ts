/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
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
 * Just merge, no compression.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const noCompress = ({ settings, content, callback, index }: MinifierOptions) => {
  if (settings && !settings.content) {
    utils.writeFile({ file: settings.output, content, index });
  }
  if (callback) {
    return callback(null, content);
  }
  return content;
};

/**
 * Expose `noCompress()`.
 */
export default noCompress;

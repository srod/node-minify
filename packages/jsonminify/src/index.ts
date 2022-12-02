/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import jsonminify from 'jsonminify';
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
 * Run jsonminify.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyJsonMinify = ({ settings, content, callback, index }: MinifierOptions) => {
  const contentMinified = jsonminify(content || '');
  if (settings && !settings.content) {
    utils.writeFile({ file: settings.output, content: contentMinified, index });
  }
  if (callback) {
    return callback(null, contentMinified);
  }
  return contentMinified;
};

/**
 * Expose `minifyJsonMinify()`.
 */
export default minifyJsonMinify;

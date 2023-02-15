/*!
 * node-minify
 * Copyright(c) 2011-2023 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import { utils } from '@node-minify/utils';
import { MinifierOptions } from '@node-minify/types';

/**
 * Just merge, no compression.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const noCompress = ({ settings, content, callback, index }: MinifierOptions) => {
  if (settings && !settings.content && settings.output) {
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
noCompress.default = noCompress;
export = noCompress;

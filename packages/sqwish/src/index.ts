/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import sqwish from 'sqwish';
import { utils } from '@node-minify/utils';
import { MinifierOptions } from '@node-minify/types';

/**
 * Run sqwish.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifySqwish = ({ settings, content, callback, index }: MinifierOptions) => {
  const contentMinified = sqwish.minify(content, settings && settings.options && settings.options.strict);
  if (settings && !settings.content && settings.output) {
    utils.writeFile({ file: settings.output, content: contentMinified, index });
  }
  if (callback) {
    return callback(null, contentMinified);
  }
  return contentMinified;
};

/**
 * Expose `minifySqwish()`.
 */
minifySqwish.default = minifySqwish;
export = minifySqwish;

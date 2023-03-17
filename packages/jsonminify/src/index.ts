/*!
 * node-minify
 * Copyright(c) 2011-2023 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import jsonminify from 'jsonminify';
import { utils } from '@node-minify/utils';
import { MinifierOptions } from '@node-minify/types';

/**
 * Run jsonminify.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyJsonMinify = ({ settings, content, callback, index }: MinifierOptions) => {
  const contentMinified = jsonminify(content ?? '');
  if (settings && !settings.content && settings.output) {
    settings.output && utils.writeFile({ file: settings.output, content: contentMinified, index });
  }
  if (callback) {
    return callback(null, contentMinified);
  }
  return contentMinified;
};

/**
 * Expose `minifyJsonMinify()`.
 */
minifyJsonMinify.default = minifyJsonMinify;
export = minifyJsonMinify;

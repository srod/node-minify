/*!
 * node-minify
 * Copyright(c) 2011-2021 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import jsonminify from 'jsonminify';
import { utils } from '@node-minify/utils';

/**
 * Run jsonminify.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyJsonMinify = ({ settings, content, callback, index }) => {
  const contentMinified = jsonminify(content);
  if (!settings.content) {
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
module.exports = minifyJsonMinify;

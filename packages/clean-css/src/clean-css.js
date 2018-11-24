/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import CleanCSS from 'clean-css';
import { utils } from '@node-minify/utils';

/**
 * Run clean-css.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyCleanCSS = ({ settings, content, callback, index }) => {
  const contentMinified = new CleanCSS(settings.options).minify(content).styles;
  utils.writeFile({ file: settings.output, content: contentMinified, index });
  if (callback) {
    return callback(null, contentMinified);
  }
  return contentMinified;
};

/**
 * Expose `minifyCleanCSS()`.
 */
module.exports = minifyCleanCSS;

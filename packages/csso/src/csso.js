/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import csso from 'csso';
import { utils } from '@node-minify/utils';

/**
 * Run csso.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const compressCSSO = ({ settings, content, callback, index }) => {
  const contentMinified = csso.minify(content, settings.options.restructureOff);
  utils.writeFile({ file: settings.output, content: contentMinified.css, index });
  if (callback) {
    return callback(null, contentMinified.css);
  }
  return contentMinified.css;
};

/**
 * Expose `compressCSSO()`.
 */
module.exports = compressCSSO;

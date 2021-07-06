/*!
 * node-minify
 * Copyright(c) 2011-2021 Rodolphe Stoclin
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
const minifyCSSO = ({ settings, content, callback, index }) => {
  const contentMinified = csso.minify(content, settings.options.restructureOff);
  if (!settings.content) {
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
module.exports = minifyCSSO;

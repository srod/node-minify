/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import csso from 'csso';
import { utils } from '../utils';

/**
 * Run csso.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */

const compressCSSO = (settings, content, callback) => {
  const contentMinified = csso.minify(content, settings.options.restructureOff);
  utils.writeFile(settings.output, contentMinified.css);
  if (callback) {
    return callback(null, contentMinified.css);
  }
  return contentMinified.css;
};

/**
 * Expose `compressCSSO()`.
 */

export { compressCSSO };

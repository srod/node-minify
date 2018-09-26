/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import uglifyES from 'uglify-es';
import { utils } from '../utils';

/**
 * Run uglifyES.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */

const compressUglifyES = (settings, content, callback, index) => {
  const contentMinified = uglifyES.minify(content, settings.options);
  if (contentMinified.error) {
    if (callback) {
      return callback(contentMinified.error);
    }
  }
  if (contentMinified.map && settings.options.sourceMap) {
    utils.writeFile(settings.options.sourceMap.url, contentMinified.map, index);
  }
  utils.writeFile(settings.output, contentMinified.code, index);
  if (callback) {
    return callback(null, contentMinified.code);
  }
  return contentMinified.code;
};

/**
 * Expose `compressUglifyES()`.
 */

export { compressUglifyES };

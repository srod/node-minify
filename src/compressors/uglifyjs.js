/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import uglifyJS from 'uglify-js';
import { utils } from '../utils';

/**
 * Run uglifyJS.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */

const compressUglifyJS = (settings, content, callback) => {
  const contentMinified = uglifyJS.minify(content, settings.options);
  if (contentMinified.map && settings.options.sourceMap) {
    utils.writeFile(settings.options.sourceMap.url, contentMinified.map);
  }
  utils.writeFile(settings.output, contentMinified.code);
  if (callback) {
    return callback(null, contentMinified.code);
  }
  return contentMinified.code;
};

/**
 * Expose `compressUglifyJS()`.
 */

export { compressUglifyJS };

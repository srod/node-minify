/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import uglifyJS from 'uglify-js';
import { utils } from '@node-minify/utils';

/**
 * Run uglifyJS.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyUglifyJS = ({ settings, content, callback, index }) => {
  const contentMinified = uglifyJS.minify(content, settings.options);
  if (contentMinified.error) {
    if (callback) {
      return callback(contentMinified.error);
    }
  }
  if (contentMinified.map && settings.options.sourceMap) {
    utils.writeFile({ file: settings.options.sourceMap.filename, content: contentMinified.map, index });
  }
  if (!settings.content) {
    utils.writeFile({ file: settings.output, content: contentMinified.code, index });
  }
  if (callback) {
    return callback(null, contentMinified.code);
  }
  return contentMinified.code;
};

/**
 * Expose `minifyUglifyJS()`.
 */
module.exports = minifyUglifyJS;

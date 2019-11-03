/*!
 * node-minify
 * Copyright(c) 2011-2019 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import uglifyES from 'uglify-es';
import { utils } from '@node-minify/utils';

/**
 * Run uglifyES.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyUglifyES = ({ settings, content, callback, index }) => {
  if (settings.options.sourceMap) {
    content = { [settings.options.sourceMap.filename]: content };
  }
  const contentMinified = uglifyES.minify(content, settings.options);
  if (contentMinified.error) {
    if (callback) {
      return callback(contentMinified.error);
    }
  }
  if (contentMinified.map && settings.options.sourceMap) {
    utils.writeFile({ file: `${settings.output}.map`, content: contentMinified.map, index });
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
 * Expose `minifyUglifyES()`.
 */
module.exports = minifyUglifyES;

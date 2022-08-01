/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import terser from 'terser';
import { utils } from '@node-minify/utils';

/**
 * Run terser.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyTerser = async ({ settings, content, callback, index }) => {
  try {
    const contentMinified = await terser.minify(content, settings.options);

    if (contentMinified.error) {
      if (callback) {
        return callback(contentMinified.error);
      }
    }
    if (contentMinified.map && settings.options.sourceMap) {
      utils.writeFile({ file: settings.options.sourceMap.url, content: contentMinified.map, index });
    }
    if (!settings.content) {
      utils.writeFile({ file: settings.output, content: contentMinified.code, index });
    }
    if (callback) {
      return callback(null, contentMinified.code);
    }
    return contentMinified.code;
  } catch (error) {
    return callback(error);
  }
};

/**
 * Expose `minifyTerser()`.
 */
module.exports = minifyTerser;

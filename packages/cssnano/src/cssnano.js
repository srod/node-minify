/*!
 * node-minify
 * Copyright(c) 2011-2020 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import postcss from 'postcss';
import cssnano from 'cssnano';
import { utils } from '@node-minify/utils';

/**
 * Run cssnano.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyCssnano = async ({ settings, content, callback, index }) => {
  let contentMinified;
  try {
    contentMinified = await postcss([cssnano]).process(content, { from: undefined });
  } catch (e) {
    if (callback) {
      return callback(e);
    }
  }
  if (!settings.content) {
    utils.writeFile({ file: settings.output, content: contentMinified.css, index });
  }
  if (callback) {
    return callback(null, contentMinified.css);
  }
  return contentMinified.css;
};

/**
 * Expose `minifyCssnano()`.
 */
module.exports = minifyCssnano;

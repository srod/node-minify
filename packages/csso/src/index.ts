/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import { minify } from 'csso';
import { utils } from '@node-minify/utils';
import { MinifierOptions } from '@node-minify/types';

/**
 * Run csso.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyCSSO = ({ settings, content, callback, index }: MinifierOptions) => {
  const contentMinified = minify(content || '', settings && settings.options);
  if (settings && !settings.content && settings.output) {
    settings.output && utils.writeFile({ file: settings.output, content: contentMinified.css, index });
  }
  if (callback) {
    return callback(null, contentMinified.css);
  }
  return contentMinified.css;
};

/**
 * Expose `minifyCSSO()`.
 */
minifyCSSO.default = minifyCSSO;
export = minifyCSSO;

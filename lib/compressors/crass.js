/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import crass from 'crass';
import { utils } from '../utils';

/**
 * Run crass.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */

const compressCrass = (settings, content, callback) => {
  const contentMinified = crass
    .parse(content)
    .optimize()
    .toString();
  utils.writeFile(settings.output, contentMinified);
  if (callback) {
    return callback(null, contentMinified);
  }
  return contentMinified;
};

/**
 * Expose `compressCrass()`.
 */

export { compressCrass };

/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import crass from 'crass';
import { utils } from '@node-minify/utils';

/**
 * Run crass.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const compressCrass = ({ settings, content, callback, index }) => {
  const contentMinified = crass
    .parse(content)
    .optimize()
    .toString();
  utils.writeFile({ file: settings.output, content: contentMinified, index });
  if (callback) {
    return callback(null, contentMinified);
  }
  return contentMinified;
};

/**
 * Expose `compressCrass()`.
 */
module.exports = compressCrass;

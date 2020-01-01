/*!
 * node-minify
 * Copyright(c) 2011-2020 Rodolphe Stoclin
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
const minifyCrass = ({ settings, content, callback, index }) => {
  const contentMinified = crass
    .parse(content)
    .optimize()
    .toString();
  if (!settings.content) {
    utils.writeFile({ file: settings.output, content: contentMinified, index });
  }
  if (callback) {
    return callback(null, contentMinified);
  }
  return contentMinified;
};

/**
 * Expose `minifyCrass()`.
 */
module.exports = minifyCrass;

/*!
 * node-minify
 * Copyright(c) 2011-2019 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import { setup } from './setup';
import { compress } from './compress';

/**
 * Run node-minify.
 *
 * @param {Object} settings - Settings from user input
 */
const minify = settings => {
  return new Promise((resolve, reject) => {
    settings = setup(settings);
    if (!settings.sync) {
      compress(settings)
        .then(minified => {
          if (settings.callback) {
            settings.callback(null, minified);
          }
          resolve(minified);
        })
        .catch(err => {
          if (settings.callback) {
            settings.callback(err);
          }
          reject(err);
        });
    } else {
      const minified = compress(settings);
      if (settings.callback) {
        settings.callback(null, minified);
      }
      resolve(minified);
    }
  });
};

/**
 * Expose `minify()`.
 */
module.exports = minify;

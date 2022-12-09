/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import { setup } from './setup';
import { compress } from './compress';
import { compressInMemory } from './compressInMemory';
import { Settings } from '@node-minify/types';

/**
 * Run node-minify.
 *
 * @param {Object} settings - Settings from user input
 */
const minify = (settings: Settings) => {
  return new Promise((resolve, reject) => {
    const method = settings.content ? compressInMemory : compress;
    settings = setup(settings);
    if (!settings.sync) {
      method(settings)
        .then((minified: string) => {
          if (settings.callback) {
            settings.callback(null, minified);
          }
          resolve(minified);
        })
        .catch((err: Error) => {
          if (settings.callback) {
            settings.callback(err);
          }
          reject(err);
        });
    } else {
      const minified = method(settings);
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
minify.default = minify;
export = minify;

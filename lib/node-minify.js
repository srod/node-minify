/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
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
        .then(min => {
          if (settings.callback) {
            settings.callback(null, min);
          }
          resolve(min);
        })
        .catch(err => {
          if (settings.callback) {
            settings.callback(err);
          }
          reject(err);
        });
    } else {
      const min = compress(settings);
      if (settings.callback) {
        settings.callback(null, min);
      }
      resolve(min);
    }
  });
};

export { minify };

/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import { minify } from '../node-minify';
import { utils } from '../utils';

const compress = options => {
  return new Promise((resolve, reject) => {
    minify(options)
      .then(() => {
        utils
          .getFilesizeGzippedInBytes(options.output)
          .then(sizeGzip => {
            resolve({
              compressor: options.compressor,
              size: utils.getFilesizeInBytes(options.output),
              sizeGzip: sizeGzip
            });
          })
          .catch(reject);
      })
      .catch(reject);
  });
};

/**
 * Expose `compress()`.
 */

export { compress };

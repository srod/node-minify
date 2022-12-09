/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import minify from '@node-minify/core';
import { utils } from '@node-minify/utils';
import { Settings, Result } from '@node-minify/types';

/**
 * Run compression.
 *
 * @param {Object} options
 */
const compress = (options: Settings): Promise<Result> => {
  return new Promise<Result>((resolve, reject) => {
    minify(options)
      .then(() => {
        if (options.output.includes('$1')) {
          // TODO handle $1 output
          // npx node-minify --compressor uglify-js --input 'source/**/*.js' --output 'source/$1.min.js' --option '{"warnings": true, "mangle": false}'
          return resolve({
            compressorLabel: options.compressorLabel || '',
            compressor: options.compressor,
            size: 0,
            sizeGzip: 0
          });
        }
        utils
          .getFilesizeGzippedInBytes(options.output)
          .then((sizeGzip: number) => {
            resolve({
              compressorLabel: options.compressorLabel || '',
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

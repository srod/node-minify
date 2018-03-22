/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var compressor = require('../node-minify');
var utils = require('../utils');

/**
 * Expose `compress()`.
 */

module.exports = compress;

function compress(options) {
  return new Promise(function(resolve, reject) {
    compressor
      .minify(options)
      .then(function() {
        utils
          .getFilesizeGzippedInBytes(options.output)
          .then(function(sizeGzip) {
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
}

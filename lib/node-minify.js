/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var deprecated = require('./deprecated');
var setup = require('./setup');
var compress = require('./compress');

/**
 * Expose `minify()`.
 */

var app = (module.exports = {});

/**
 * Run node-minify.
 *
 * @param {Object} settings - Settings from user input
 */

app.minify = function minify(settings) {
  deprecated(this.constructor.name, settings);
  return new Promise(function(resolve, reject) {
    settings = setup(settings);
    if (!settings.sync) {
      compress(settings)
        .then(function(min) {
          if (settings.callback) {
            settings.callback(null, min);
          }
          resolve(min);
        })
        .catch(function(err) {
          if (settings.callback) {
            settings.callback(err);
          }
          reject(err);
        });
    } else {
      var min = compress(settings);
      if (settings.callback) {
        settings.callback(null, min);
      }
      resolve(min);
    }
  });
};

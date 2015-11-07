/*!
 * node-minify
 * Copyright(c) 2011-2016 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');

/**
 * Expose `utils`.
 */

var utils = module.exports = {};

/**
 * Write data into file.
 *
 * @param {String} file
 * @param {String} data
 * @returns {String}
 */

utils.writeFile = function writeFile(file, data) {
  fs.writeFileSync(file, data, 'utf8');
  return data;
};

/**
 * Builds arguments array based on an object.
 *
 * @param {Object} options
 * @returns {Array}
 */

utils.buildArgs = function buildArgs(options) {
  var args = [];

  Object.keys(options).forEach(function(key) {
    if (options[key] && options[key] !== false) {
      args.push('--' + key);
    }

    if (options[key] && options[key] !== true) {
      args.push(options[key]);
    }
  });

  return args;
};

/**
 * Clone an object.
 *
 * @param {Object} obj
 */

utils.clone = function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
};

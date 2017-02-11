/*!
 * node-minify
 * Copyright(c) 2011-2017 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');
var nodeVersion = require('node-version');

/**
 * Expose `utils`.
 */

var utils = module.exports = {};

/**
 * Read content from file.
 *
 * @param {String} file
 * @returns {String}
 */

utils.readFile = function readFile(file) {
  return fs.readFileSync(file, 'utf8');
};

/**
 * Write content into file.
 *
 * @param {String} file
 * @param {String} content
 * @returns {String}
 */

utils.writeFile = function writeFile(file, content) {
  fs.writeFileSync(file, content, 'utf8');
  return content;
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
 * @returns {Object}
 */

utils.clone = function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check in node is higher or equal to 4.
 *
 * @returns {Boolean}
 */

utils.isNodeV4AndHigher = function isNodeV4AndHigher() {
  return parseInt(nodeVersion.major, 10) >= 4;
};

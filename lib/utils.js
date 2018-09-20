/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');
var nodeVersion = require('node-version');
var gzipSize = require('gzip-size');

/**
 * Expose `utils`.
 */

var utils = (module.exports = {});

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
 * @param {Number} index - index of the file being processed
 * @returns {String}
 */

utils.writeFile = function writeFile(file, content, index) {
  fs.writeFileSync(index !== undefined ? file[index] : file, content, 'utf8');
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

/**
 * Get the file size in bytes.
 *
 * @returns {String}
 */

utils.getFilesizeInBytes = function(file) {
  var stats = fs.statSync(file);
  var fileSizeInBytes = stats.size;
  return utils.prettyBytes(fileSizeInBytes);
};

/**
 * Get the gzipped file size in bytes.
 *
 * @returns {Promise.<String>}
 */

utils.getFilesizeGzippedInBytes = function(file) {
  return new Promise(function(resolve) {
    var source = fs.createReadStream(file);
    source.pipe(gzipSize.stream()).on('gzip-size', function(size) {
      resolve(utils.prettyBytes(size));
    });
  });
};

/**
 * Get the size in human readable.
 * From https://github.com/sindresorhus/pretty-bytes
 *
 * @returns {String}
 */

utils.prettyBytes = function(num) {
  var UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  if (!Number.isFinite(num)) {
    throw new TypeError('Expected a finite number, got ' + typeof num + ': ' + num);
  }

  var neg = num < 0;

  if (neg) {
    num = -num;
  }

  if (num < 1) {
    return (neg ? '-' : '') + num + ' B';
  }

  var exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), UNITS.length - 1);
  var numStr = Number((num / Math.pow(1000, exponent)).toPrecision(3));
  var unit = UNITS[exponent];

  return (neg ? '-' : '') + numStr + ' ' + unit;
};

/**
 * Set the file name as minified.
 * eg. file.js returns file.min.js
 *
 * @param {String} file
 * @param {String} output
 * @returns {String}
 */

utils.setFileNameMin = function(file, output) {
  var fileWithoutPath = file.substr(file.lastIndexOf('/') + 1);
  var fileWithoutExtension = fileWithoutPath.substr(0, fileWithoutPath.lastIndexOf('.js'));
  return output.replace('$1', fileWithoutExtension);
};

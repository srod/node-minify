/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import fs from 'fs';
import nodeVersion from 'node-version';
import gzipSize from 'gzip-size';

const utils = {};

/**
 * Read content from file.
 *
 * @param {String} file
 * @returns {String}
 */

utils.readFile = file => fs.readFileSync(file, 'utf8');

/**
 * Write content into file.
 *
 * @param {String} file
 * @param {String} content
 * @returns {String}
 */

utils.writeFile = (file, content) => {
  fs.writeFileSync(file, content, 'utf8');
  return content;
};

/**
 * Builds arguments array based on an object.
 *
 * @param {Object} options
 * @returns {Array}
 */

utils.buildArgs = options => {
  const args = [];

  Object.keys(options).forEach(key => {
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

utils.clone = obj => JSON.parse(JSON.stringify(obj));

/**
 * Check in node is higher or equal to 4.
 *
 * @returns {Boolean}
 */

utils.isNodeV4AndHigher = () => parseInt(nodeVersion.major, 10) >= 4;

/**
 * Get the file size in bytes.
 *
 * @returns {String}
 */

utils.getFilesizeInBytes = file => {
  const stats = fs.statSync(file);
  const fileSizeInBytes = stats.size;
  return utils.prettyBytes(fileSizeInBytes);
};

/**
 * Get the gzipped file size in bytes.
 *
 * @returns {Promise.<String>}
 */

utils.getFilesizeGzippedInBytes = file => {
  return new Promise(resolve => {
    const source = fs.createReadStream(file);
    source.pipe(gzipSize.stream()).on('gzip-size', size => {
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

utils.prettyBytes = num => {
  const UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  if (!Number.isFinite(num)) {
    throw new TypeError(`Expected a finite number, got ${typeof num}: ${num}`);
  }

  const neg = num < 0;

  if (neg) {
    num = -num;
  }

  if (num < 1) {
    return (neg ? '-' : '') + num + ' B';
  }

  const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), UNITS.length - 1);
  const numStr = Number((num / Math.pow(1000, exponent)).toPrecision(3));
  const unit = UNITS[exponent];

  return (neg ? '-' : '') + numStr + ' ' + unit;
};

/**
 * Expose `utils`.
 */

export { utils };

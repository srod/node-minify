/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import fs from 'fs';
import mkdirp from 'mkdirp';
import { utils } from './utils';
import {
  compressBabelMinify,
  compressButternut,
  compressCleanCSS,
  compressCrass,
  compressCSSO,
  compressGCC,
  noCompress,
  compressSqwish,
  compressUglifyJS,
  compressYUI
} from './compressors';

let gcc;

if ((process.execArgv && process.execArgv.indexOf('--use_strict') > -1) || !utils.isNodeV4AndHigher()) {
  gcc = require('./compressors/gcc-java').compressGCC;
} else {
  gcc = require('./compressors/gcc').compressGCCJS;
}

/**
 * Mapping input compressors to functions
 * to be executed
 */

const compressorsMap = {
  'babel-minify': compressBabelMinify,
  butternut: compressButternut,
  yui: (settings, data, callback) => {
    return compressYUI('css', settings, data, callback);
  },
  'yui-css': (settings, data, callback) => {
    return compressYUI('css', settings, data, callback);
  },
  'yui-js': (settings, data, callback) => {
    return compressYUI('js', settings, data, callback);
  },
  gcc,
  'gcc-java': (settings, data, callback) => {
    return compressGCC(settings, data, callback, false);
  },
  'gcc-legacy': (settings, data, callback) => {
    return compressGCC(settings, data, callback, true);
  },
  uglifyjs: compressUglifyJS,
  sqwish: compressSqwish,
  'clean-css': compressCleanCSS,
  crass: compressCrass,
  csso: compressCSSO,
  'no-compress': noCompress
};

/**
 * Run compressor.
 *
 * @param {Object} settings
 */

const compress = settings => {
  if (typeof compressorsMap[settings.compressor] !== 'function') {
    throw new Error(`Type "${settings.compressor}" does not exist`);
  }

  createDirectory(settings.output);
  const content = getContentFromFiles(settings.input);
  return settings.sync ? runSync(settings, content) : runAsync(settings, content);
};

/**
 * Run compressor in sync.
 *
 * @param {Object} settings
 * @param {String} content
 * @return {String}
 */

const runSync = (settings, content) => compressorsMap[settings.compressor](settings, content);

/**
 * Run compressor in async.
 *
 * @param {Object} settings
 * @param {String} content
 * @return {Promise}
 */

const runAsync = (settings, content) => {
  return new Promise((resolve, reject) => {
    compressorsMap[settings.compressor](settings, content, (err, min) => {
      if (err) {
        return reject(err);
      }
      resolve(min);
    });
  });
};

/**
 * Concatenate all input files and get the data.
 *
 * @param {String|Array} input
 * @return {String}
 */

const getContentFromFiles = input => {
  if (!Array.isArray(input)) {
    return fs.readFileSync(input, 'utf8');
  }

  return input.map(path => fs.readFileSync(path, 'utf8')).join('\n');
};

/**
 * Create folder of the target file.
 *
 * @param {String} file - Full path of the file
 */

const createDirectory = file => mkdirp.sync(file.substr(0, file.lastIndexOf('/')));

/**
 * Expose `compress()`.
 */

export { compress };

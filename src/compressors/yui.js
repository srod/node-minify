/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import path from 'path';
import { utils } from '../utils';
import { runCommandLine } from '../runner';

/**
 * Module variables.
 */
const binYui = path.normalize(__dirname + '/../binaries/yuicompressor-2.4.7.jar');

/**
 * Run YUI Compressor.
 *
 * @param {String} type
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */

const compressYUI = (type, settings, content, callback) => {
  return runCommandLine(yuiCommand(type, settings.options), content, settings, (err, contentMinified) => {
    if (err) {
      if (callback) {
        return callback(err);
      } else {
        throw err;
      }
    }
    utils.writeFile(settings.output, contentMinified);
    if (callback) {
      return callback(null, contentMinified);
    }
    return contentMinified;
  });
};

/**
 * YUI Compressor CSS command line.
 */

const yuiCommand = (type, options) => {
  return ['-jar', '-Xss2048k', binYui, '--type', type].concat(utils.buildArgs(options));
};

/**
 * Expose `compressYUI()`.
 */

export { compressYUI };

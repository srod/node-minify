'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compress = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _utils = require('./utils');

var _compressors = require('./compressors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var gcc = void 0;

if (process.execArgv && process.execArgv.indexOf('--use_strict') > -1 || !_utils.utils.isNodeV4AndHigher()) {
  gcc = require('./compressors/gcc-java').compressGCC;
} else {
  gcc = require('./compressors/gcc').compressGCCJS;
}

/**
 * Mapping input compressors to functions
 * to be executed
 */

var compressorsMap = {
  'babel-minify': _compressors.compressBabelMinify,
  butternut: _compressors.compressButternut,
  yui: function yui(settings, data, callback) {
    return (0, _compressors.compressYUI)('css', settings, data, callback);
  },
  'yui-css': function yuiCss(settings, data, callback) {
    return (0, _compressors.compressYUI)('css', settings, data, callback);
  },
  'yui-js': function yuiJs(settings, data, callback) {
    return (0, _compressors.compressYUI)('js', settings, data, callback);
  },
  gcc: gcc,
  'gcc-java': function gccJava(settings, data, callback) {
    return (0, _compressors.compressGCC)(settings, data, callback, false);
  },
  'gcc-legacy': function gccLegacy(settings, data, callback) {
    return (0, _compressors.compressGCC)(settings, data, callback, true);
  },
  uglifyjs: _compressors.compressUglifyJS,
  sqwish: _compressors.compressSqwish,
  'clean-css': _compressors.compressCleanCSS,
  csso: _compressors.compressCSSO,
  'no-compress': _compressors.noCompress
};

/**
 * Run compressor.
 *
 * @param {Object} settings
 */

var compress = function compress(settings) {
  if (typeof compressorsMap[settings.compressor] !== 'function') {
    throw new Error('Type "' + settings.compressor + '" does not exist');
  }

  createDirectory(settings.output);
  var content = getContentFromFiles(settings.input);
  return settings.sync ? runSync(settings, content) : runAsync(settings, content);
};

/**
 * Run compressor in sync.
 *
 * @param {Object} settings
 * @param {String} content
 * @return {String}
 */

var runSync = function runSync(settings, content) {
  return compressorsMap[settings.compressor](settings, content);
};

/**
 * Run compressor in async.
 *
 * @param {Object} settings
 * @param {String} content
 * @return {Promise}
 */

var runAsync = function runAsync(settings, content) {
  return new Promise(function (resolve, reject) {
    compressorsMap[settings.compressor](settings, content, function (err, min) {
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

var getContentFromFiles = function getContentFromFiles(input) {
  if (!Array.isArray(input)) {
    return _fs2.default.readFileSync(input, 'utf8');
  }

  return input.map(function (path) {
    return _fs2.default.readFileSync(path, 'utf8');
  }).join('\n');
};

/**
 * Create folder of the target file.
 *
 * @param {String} file - Full path of the file
 */

var createDirectory = function createDirectory(file) {
  return _mkdirp2.default.sync(file.substr(0, file.lastIndexOf('/')));
};

/**
 * Expose `compress()`.
 */

exports.compress = compress;
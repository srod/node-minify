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
var path = require('path');
var glob = require('glob');
var extend = require('xtend');

/**
 * Default settings.
 */

var defaultSettings = {
  sync: false,
  options: {},
  buffer: 1000 * 1024,
  callback: false
};

/**
 * Expose `setup()`.
 */

module.exports = setup;

/**
 * Run setup.
 *
 * @param {Object} inputSettings
 * @return {Object}
 */

function setup(inputSettings) {
  checkMandatories(inputSettings);

  var settings = extend(clone(defaultSettings), inputSettings);
  settings = extend(settings, wildcards(settings.fileIn, settings.publicFolder));
  settings = extend(settings, setPublicFolder(settings.fileIn, settings.publicFolder));

  return settings;
}

/**
 * Handle wildcards in a path, get the real path of each files.
 *
 * @param {String} fileIn - Path with wildcards
 * @param {String} publicFolder - Path to the public folder
 * @return {Object}
 */

function wildcards(fileIn, publicFolder) {
  var output = {};

  if (fileIn.indexOf('*') > -1) {
    output.fileIn = glob.sync((publicFolder || '') + fileIn, null);

    if (typeof publicFolder === 'string') {
      output.publicFolder = null;
    }
  }

  return output;
}

/**
 * Prepend the public folder to each file.
 *
 * @param {String|Array} fileIn - Path to file(s)
 * @param {String} publicFolder - Path to the public folder
 * @return {Object}
 */

function setPublicFolder(fileIn, publicFolder) {
  var output = {};

  if (typeof publicFolder !== 'string') {
    return output;
  }

  if (Array.isArray(fileIn)) {
    output.fileIn = fileIn.map(function(item) {
      return path.normalize(publicFolder + item);
    });
    return output;
  }

  output.fileIn = path.normalize(publicFolder + fileIn);

  return output;
}

/**
 * Check if some settings are here.
 *
 * @param {Object} settings
 */

function checkMandatories(settings) {
  [
    'type',
    'fileIn',
    'fileOut'
  ].forEach(function(item) {
    mandatory(item, settings);
  });
}

/**
 * Check if the setting exist.
 *
 * @param {String} setting
 * @param {Object} settings
 */

function mandatory(setting, settings) {
  if (!settings[setting]) {
    throw new Error(setting + ' is mandatory.');
  }
}

/**
 * Clone an object.
 *
 * @param {Object} obj
 */

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

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
var utils = require('./utils');

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

  var settings = extend(utils.clone(defaultSettings), inputSettings);
  settings = extend(settings, wildcards(settings.input, settings.publicFolder));
  settings = extend(settings, setPublicFolder(settings.input, settings.publicFolder));

  return settings;
}

/**
 * Handle wildcards in a path, get the real path of each files.
 *
 * @param {String} input - Path with wildcards
 * @param {String} publicFolder - Path to the public folder
 * @return {Object}
 */

function wildcards(input, publicFolder) {
  var output = {};

  if (input.indexOf('*') > -1) {
    output.input = glob.sync((publicFolder || '') + input, null);

    if (typeof publicFolder === 'string') {
      output.publicFolder = null;
    }
  }

  return output;
}

/**
 * Prepend the public folder to each file.
 *
 * @param {String|Array} input - Path to file(s)
 * @param {String} publicFolder - Path to the public folder
 * @return {Object}
 */

function setPublicFolder(input, publicFolder) {
  var output = {};

  if (typeof publicFolder !== 'string') {
    return output;
  }

  if (Array.isArray(input)) {
    output.input = input.map(function(item) {
      return path.normalize(publicFolder + item);
    });
    return output;
  }

  output.input = path.normalize(publicFolder + input);

  return output;
}

/**
 * Check if some settings are here.
 *
 * @param {Object} settings
 */

function checkMandatories(settings) {
  [
    'compressor',
    'input',
    'output'
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

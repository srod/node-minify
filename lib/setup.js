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
 * Expose `setup()`.
 */

module.exports = setup;

/**
 * Run setup.
 *
 * @return {Function}
 */

var defaultSettings = {
  language: null,
  tempPath: '.',
  sync: false,
  options: [],
  buffer: 1000 * 1024,
  copyright: false,
  callback: false
};

function wildcards(settings) {
  var output = {};

  if (settings.fileIn.indexOf('*') > -1) {
    output.fileIn = glob.sync((settings.publicFolder || '') + settings.fileIn, null);

    if (typeof settings.publicFolder === 'string') {
      output.publicFolder = null;
    }
  }

  return output;
}

function setPublicFolder(settings) {
  var output = {};

  if (typeof settings.publicFolder !== 'string') {
    return output;
  }

  if (Array.isArray(settings.fileIn)) {
    output.fileIn = settings.fileIn.map(function(item) {
      return path.normalize(settings.publicFolder + item);
    });
    return output;
  }

  output.fileIn = path.normalize(settings.publicFolder + settings.fileIn);

  return output;
}

function setup(inputSettings) {
  checkMandatories(inputSettings);

  var settings = extend(defaultSettings, inputSettings);
  settings = extend(settings, wildcards(settings));
  settings = extend(settings, setPublicFolder(settings));

  return settings;
}

function checkMandatories(options) {
  [
    'type',
    'fileIn',
    'fileOut'
  ].forEach(function(item) {
    mandatory(item, options);
  });
}

function mandatory(setting, options) {
  if (!options[setting]) {
    throw new Error(setting + ' is mandatory.');
  }
}

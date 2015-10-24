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
var uuid = require('node-uuid');
var mkdirp = require('mkdirp');
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

function handleWildcards(settings) {
  var output = {};

  if (settings.fileIn.indexOf('*') > -1) {
    output.fileIn = glob.sync((settings.publicFolder || '') + settings.fileIn, null);

    if (typeof settings.publicFolder === 'string') {
      output.publicFolder = null;
    }
  }

  return output;
}

function handlePublicFolder(settings) {
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

function handleTempFile(settings) {
  var output = {};

  if (Array.isArray(settings.fileIn) && settings.type !== 'gcc') {
    var out = settings.fileIn.map(function(path) {
      return fs.readFileSync(path, 'utf8');
    });
    fs.writeFileSync(settings.tempFile, out.join('\n'), 'utf8');
    output.fileIn = settings.tempFile;
  }

  return output;
}

function setup(inputSettings) {
  checkMandatories(inputSettings);

  var settings = extend(defaultSettings, inputSettings);
  var tempFile = '/' + new Date().getTime().toString() + '-' + uuid.v4() + '.tmp';

  settings.tempFile = path.normalize(settings.tempPath + tempFile);
  settings = extend(settings, handleWildcards(settings));
  settings = extend(settings, handlePublicFolder(settings));
  settings = extend(settings, handleTempFile(settings));

  createDirectory(settings);

  //console.log(settings);

  return settings;
}

function createDirectory(settings) {
  var dirOut = settings.fileOut.substr(0, settings.fileOut.lastIndexOf('/'));
  mkdirp.sync(dirOut);
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

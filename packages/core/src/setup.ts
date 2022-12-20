/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import path from 'path';
import { globbySync } from 'globby';
import { utils } from '@node-minify/utils';
import { Dictionary } from '@node-minify/types';

/**
 * Default settings.
 */
const defaultSettings = {
  sync: false,
  options: {},
  buffer: 1000 * 1024,
  callback: false
};

/**
 * Run setup.
 *
 * @param {Object} inputSettings
 * @return {Object}
 */
const setup = (inputSettings: object) => {
  let settings = Object.assign(utils.clone(defaultSettings), inputSettings);

  // In memory
  if (settings.content) {
    checkMandatoriesMemoryContent(inputSettings);
    return settings;
  }

  checkMandatories(inputSettings);

  settings = Object.assign(settings, wildcards(settings.input, settings.publicFolder));
  settings = Object.assign(
    settings,
    checkOutput(settings.input, settings.output, settings.publicFolder, settings.replaceInPlace)
  );
  settings = Object.assign(settings, setPublicFolder(settings.input, settings.publicFolder));

  return settings;
};

/**
 * Check the output path, searching for $1
 * if exist, returns the path remplacing $1 by file name
 *
 * @param {String|Array} input - Path file
 * @param {String} output - Path to the output file
 * @param {String} publicFolder - Path to the public folder
 * @param {Boolean} replaceInPlace - True to replace file in same folder
 * @return {Object}
 */
const checkOutput = (input: string | string[], output: string, publicFolder: string, replaceInPlace: boolean) => {
  const reg = new RegExp('\\$1');
  if (reg.test(output)) {
    if (Array.isArray(input)) {
      const outputMin = input.map(file =>
        utils.setFileNameMin(file, output, replaceInPlace ? null : publicFolder, replaceInPlace)
      );
      return { output: outputMin };
    } else {
      return { output: utils.setFileNameMin(input, output, replaceInPlace ? null : publicFolder, replaceInPlace) };
    }
  }
};

/**
 * Handle wildcards in a path, get the real path of each files.
 *
 * @param {String|Array} input - Path with wildcards
 * @param {String} publicFolder - Path to the public folder
 * @return {Object}
 */
const wildcards = (input: string | string[], publicFolder: string) => {
  // If it's a string
  if (!Array.isArray(input)) {
    return wildcardsString(input, publicFolder);
  }

  return wildcardsArray(input, publicFolder);
};

/**
 * Handle wildcards in a path (string only), get the real path of each files.
 *
 * @param {String} input - Path with wildcards
 * @param {String} publicFolder - Path to the public folder
 * @return {Object}
 */
const wildcardsString = (input: string, publicFolder: string) => {
  const output: { input?: string[] } = {};

  if (input.indexOf('*') > -1) {
    output.input = getFilesFromWildcards(input, publicFolder);
  }

  return output;
};

/**
 * Handle wildcards in a path (array only), get the real path of each files.
 *
 * @param {Array} input - Path with wildcards
 * @param {String} publicFolder - Path to the public folder
 * @return {Object}
 */
const wildcardsArray = (input: string[], publicFolder: string) => {
  const output: { input?: string[] } = {};
  let isWildcardsPresent = false;

  output.input = input;

  // Transform all wildcards to path file
  const inputWithPublicFolder = input.map(item => {
    if (item.indexOf('*') > -1) {
      isWildcardsPresent = true;
    }
    return (publicFolder || '') + item;
  });

  if (isWildcardsPresent) {
    output.input = globbySync(inputWithPublicFolder);
  }

  // Remove all wildcards from array
  for (let i = 0; i < output.input.length; i++) {
    if (output.input[i].indexOf('*') > -1) {
      output.input.splice(i, 1);

      i--;
    }
  }

  return output;
};

/**
 * Get the real path of each files.
 *
 * @param {String} input - Path with wildcards
 * @param {String} publicFolder - Path to the public folder
 * @return {Object}
 */
const getFilesFromWildcards = (input: string, publicFolder: string) => {
  let output: string[] = [];

  if (input.indexOf('*') > -1) {
    output = globbySync((publicFolder || '') + input);
  }

  return output;
};

/**
 * Prepend the public folder to each file.
 *
 * @param {String|Array} input - Path to file(s)
 * @param {String} publicFolder - Path to the public folder
 * @return {Object}
 */
const setPublicFolder = (input: string | string[], publicFolder: string) => {
  const output: { input?: string | string[] } = {};

  if (typeof publicFolder !== 'string') {
    return output;
  }

  publicFolder = path.normalize(publicFolder);

  if (Array.isArray(input)) {
    output.input = input.map(item => {
      // Check if publicFolder is already in path
      if (path.normalize(item).indexOf(publicFolder) > -1) {
        return item;
      }
      return path.normalize(publicFolder + item);
    });
    return output;
  }

  input = path.normalize(input);

  // Check if publicFolder is already in path
  if (input.indexOf(publicFolder) > -1) {
    output.input = input;
    return output;
  }

  output.input = path.normalize(publicFolder + input);

  return output;
};

/**
 * Check if some settings are here.
 *
 * @param {Object} settings
 */
const checkMandatories = (settings: object) => {
  ['compressor', 'input', 'output'].forEach(item => mandatory(item, settings));
};

/**
 * Check if some settings are here for memory content.
 *
 * @param {Object} settings
 */
const checkMandatoriesMemoryContent = (settings: object) => {
  ['compressor', 'content'].forEach(item => mandatory(item, settings));
};

/**
 * Check if the setting exist.
 *
 * @param {String} setting
 * @param {Object} settings
 */
const mandatory = (setting: string, settings: Dictionary<string>) => {
  if (!settings[setting]) {
    throw new Error(setting + ' is mandatory.');
  }
};

/**
 * Expose `setup()`.
 */
export { setup };
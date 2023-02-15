/*!
 * node-minify
 * Copyright(c) 2011-2023 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import uglifyJS from 'uglify-js';
import { utils } from '@node-minify/utils';
import { MinifierOptions, Options, Settings } from '@node-minify/types';

interface OptionsUglifyJS extends Omit<Options, 'sourceMap'> {
  sourceMap?: { filename: string };
}

interface SettingsUglifyJS extends Omit<Settings, 'options'> {
  options: OptionsUglifyJS;
}

interface MinifierOptionsUglifyJS extends Omit<MinifierOptions, 'settings'> {
  settings: SettingsUglifyJS;
}

/**
 * Run uglifyJS.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyUglifyJS = ({ settings, content, callback, index }: MinifierOptionsUglifyJS) => {
  const contentMinified = uglifyJS.minify(typeof content === 'string' ? content : '', settings && settings.options);
  if (contentMinified.error) {
    if (callback) {
      return callback(contentMinified.error);
    }
  }
  if (contentMinified.map && settings && typeof settings.options.sourceMap === 'object') {
    // TODO
    utils.writeFile({ file: settings.options.sourceMap.filename, content: contentMinified.map, index });
  }
  if (settings && !settings.content && settings.output) {
    utils.writeFile({ file: settings.output, content: contentMinified.code, index });
  }
  if (callback) {
    return callback(null, contentMinified.code);
  }
  return contentMinified.code;
};

/**
 * Expose `minifyUglifyJS()`.
 */
minifyUglifyJS.default = minifyUglifyJS;
export = minifyUglifyJS;

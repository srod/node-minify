/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import uglifyES from 'uglify-es';
import { utils } from '@node-minify/utils';
import { MinifierOptions, Options, Settings, Dictionary } from '@node-minify/types';

interface OptionsUglifyES extends Omit<Options, 'sourceMap'> {
  sourceMap?: { filename: string };
}

interface SettingsUglifyES extends Omit<Settings, 'options'> {
  options: OptionsUglifyES;
}

interface MinifierOptionsUglifyES extends Omit<MinifierOptions, 'settings'> {
  settings: SettingsUglifyES;
}

/**
 * Run uglifyES.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyUglifyES = ({ settings, content, callback, index }: MinifierOptionsUglifyES) => {
  let content2: string | Dictionary<string> = content || '';
  if (settings && typeof settings.options.sourceMap === 'object') {
    content2 = { [settings.options.sourceMap.filename || '']: content || '' };
  }
  const contentMinified = uglifyES.minify(content2, settings && settings.options);
  if (contentMinified.error) {
    if (callback) {
      return callback(contentMinified.error);
    }
  }
  if (contentMinified.map && settings && settings.options.sourceMap) {
    utils.writeFile({ file: `${settings.output}.map`, content: contentMinified.map, index });
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
 * Expose `minifyUglifyES()`.
 */
minifyUglifyES.default = minifyUglifyES;
export = minifyUglifyES;

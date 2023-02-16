/*!
 * node-minify
 * Copyright(c) 2011-2023 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import { minify } from 'terser';
import { utils } from '@node-minify/utils';
import { MinifierOptions, Options, Settings } from '@node-minify/types';

interface OptionsTerser extends Omit<Options, 'sourceMap'> {
  sourceMap?: { url: string };
}

interface SettingsTerser extends Omit<Settings, 'options'> {
  options: OptionsTerser;
}

interface MinifierOptionsTerser extends Omit<MinifierOptions, 'settings'> {
  settings: SettingsTerser;
}

/**
 * Run terser.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyTerser = async ({ settings, content, callback, index }: MinifierOptionsTerser) => {
  try {
    const contentMinified = await minify(content || '', settings && settings.options);
    if (
      contentMinified.map &&
      settings &&
      settings.options &&
      typeof settings.options.sourceMap === 'object' &&
      typeof settings.options.sourceMap.url === 'string'
    ) {
      utils.writeFile({ file: settings.options.sourceMap.url, content: contentMinified.map, index });
    }
    if (settings && !settings.content && settings.output) {
      utils.writeFile({ file: settings.output, content: contentMinified.code, index });
    }
    if (callback) {
      return callback(null, contentMinified.code);
    }
    return contentMinified.code;
  } catch (error) {
    return callback && callback(error);
  }
};

/**
 * Expose `minifyTerser()`.
 */
minifyTerser.default = minifyTerser;
export = minifyTerser;

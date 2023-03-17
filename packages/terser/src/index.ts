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
import { MinifierOptions } from '@node-minify/types';

type OptionsTerser = {
  sourceMap?: { url: string };
};

type SettingsTerser = {
  options: OptionsTerser;
};

type MinifierOptionsTerser = {
  settings: SettingsTerser;
};

/**
 * Run terser.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyTerser = async ({ settings, content, callback, index }: MinifierOptions & MinifierOptionsTerser) => {
  try {
    const contentMinified = await minify(content ?? '', settings?.options);
    if (contentMinified.map && typeof settings?.options?.sourceMap?.url === 'string') {
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

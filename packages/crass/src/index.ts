/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import crass from 'crass';
import { utils } from '@node-minify/utils';
import { MinifierOptions } from '@node-minify/types';

// interface Options {
//   sourceMap?: boolean;
//   _sourceMap?: { url: string } | boolean;
// }

// interface Settings {
//   options: Options;
//   content: string;
//   output: string;
// }

// interface MinifierOptions {
//   settings: Settings;
//   content: string;
//   callback: Function;
//   index: number;
// }

/**
 * Run crass.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyCrass = ({ settings, content, callback, index }: MinifierOptions) => {
  const contentMinified = crass.parse(content).optimize().toString();
  if (settings && !settings.content) {
    utils.writeFile({ file: settings.output, content: contentMinified, index });
  }
  if (callback) {
    return callback(null, contentMinified);
  }
  return contentMinified;
};

/**
 * Expose `minifyCrass()`.
 */
export default minifyCrass;

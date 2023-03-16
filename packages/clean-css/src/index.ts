/*!
 * node-minify
 * Copyright(c) 2011-2023 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import CleanCSS from 'clean-css';
import { utils } from '@node-minify/utils';
import { MinifierOptions } from '@node-minify/types';

/**
 * Run clean-css.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 * @param {Number} index
 */
const minifyCleanCSS = ({ settings, content, callback, index }: MinifierOptions) => {
  if (settings?.options?.sourceMap) {
    settings.options._sourceMap = settings.options.sourceMap;
    settings.options.sourceMap = true;
  }
  const _cleanCSS = new CleanCSS(settings && { returnPromise: false, ...settings.options }).minify(content ?? '');
  const contentMinified = _cleanCSS.styles;
  if (_cleanCSS.sourceMap && typeof settings?.options?._sourceMap === 'object') {
    utils.writeFile({
      file: typeof settings.options._sourceMap.url === 'string' ? settings.options._sourceMap.url : '',
      content: _cleanCSS.sourceMap.toString(),
      index
    });
  }
  if (settings && !settings.content && settings.output) {
    settings.output && utils.writeFile({ file: settings.output, content: contentMinified, index });
  }
  if (callback) {
    return callback(null, contentMinified);
  }
  return contentMinified;
};

/**
 * Expose `minifyCleanCSS()`.
 */
minifyCleanCSS.default = minifyCleanCSS;
export = minifyCleanCSS;

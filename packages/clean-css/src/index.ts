/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
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
 */
const minifyCleanCSS = ({ settings, content, callback, index }: MinifierOptions) => {
  if (settings && settings.options && settings.options.sourceMap) {
    settings.options._sourceMap = settings.options.sourceMap;
    settings.options.sourceMap = true;
  }
  const _cleanCSS = new CleanCSS(settings && settings.options).minify(content || '');
  const contentMinified = _cleanCSS.styles;
  if (_cleanCSS.sourceMap && settings && settings.options && settings.options._sourceMap) {
    utils.writeFile({
      file:
        settings.options._sourceMap !== true && settings.options._sourceMap.url
          ? settings.options._sourceMap.url
          : null,
      content: _cleanCSS.sourceMap.toString(),
      index
    });
  }
  if (settings && !settings.content) {
    utils.writeFile({ file: settings.output, content: contentMinified, index });
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

/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import minifier from 'html-minifier';
import { utils } from '@node-minify/utils';
import { MinifierOptions } from '@node-minify/types';

/**
 * Module variables.
 */
const HTMLMinifier = minifier.minify;
const defaultOptions = {
  collapseBooleanAttributes: true,
  collapseInlineTagWhitespace: true,
  collapseWhitespace: true,
  minifyCSS: true,
  minifyJS: true,
  removeAttributeQuotes: true,
  removeCDATASectionsFromCDATA: true,
  removeComments: true,
  removeCommentsFromCDATA: true,
  removeEmptyAttributes: true,
  removeOptionalTags: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true
};

/**
 * Run html-minifier.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyHTMLMinifier = ({ settings, content, callback, index }: MinifierOptions) => {
  const options = Object.assign({}, defaultOptions, settings && settings.options);
  const contentMinified = HTMLMinifier(content || '', options);
  if (settings && !settings.content) {
    utils.writeFile({ file: settings.output, content: contentMinified, index });
  }
  if (callback) {
    return callback(null, contentMinified);
  }
  return contentMinified;
};

/**
 * Expose `minifyHTMLMinifier()`.
 */
minifyHTMLMinifier.default = minifyHTMLMinifier;
export = minifyHTMLMinifier;

/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

// import path from 'path';
import dirname from 'es-dirname';
import { utils } from '@node-minify/utils';
import { runCommandLine } from '@node-minify/run';
import { MinifierOptions } from '@node-minify/types';

/**
 * Module variables.
 */
const binYui = `${dirname()}/binaries/yuicompressor-2.4.7.jar`;

/**
 * Run YUI Compressor.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyYUI = ({ settings, content, callback, index }: MinifierOptions) => {
  return runCommandLine({
    args: yuiCommand(settings && settings.type, settings && settings.options),
    data: content,
    settings,
    callback: (err: unknown, content?: string) => {
      if (err) {
        if (callback) {
          return callback(err);
        } else {
          throw err;
        }
      }
      if (settings && !settings.content && settings.output) {
        utils.writeFile({ file: settings.output, content, index });
      }
      if (callback) {
        return callback(null, content);
      }
      return content;
    }
  });
};

/**
 * YUI Compressor CSS command line.
 */
const yuiCommand = (type = 'js', options: any) => {
  return ['-jar', '-Xss2048k', binYui, '--type', type].concat(utils.buildArgs(options || {}));
};

/**
 * Expose `minifyYUI()`.
 */
minifyYUI.default = minifyYUI;
export = minifyYUI;

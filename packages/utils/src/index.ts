/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import fs from 'fs';
import gzipSize from 'gzip-size';
import { MinifierOptions } from '@node-minify/types';
// import { MinifierOptions } from '../../../types';

interface Utils {
  readFile: Function;
  writeFile: Function;
  deleteFile: Function;
  buildArgs: Function;
  clone: Function;
  getFilesizeInBytes: Function;
  getFilesizeGzippedInBytes: Function;
  prettyBytes: Function;
  setFileNameMin: Function;
  compressSingleFile: Function;
  getContentFromFiles: Function;
  runSync: Function;
  runAsync: Function;
}

// interface Options {
//   // sourceMap?: { filename: string };
//   // _sourceMap?: { url: string } | boolean;
// }

// interface Settings {
//   compressor: Function;
//   options: Options;
//   content: string;
//   output: string;
//   type: string;
// }

// interface MinifierOptions {
//   settings: Settings;
//   content: string /* | Dictionary<string> */;
//   callback: Function;
//   index: number;
//   input: string;
//   sync: boolean;
// }

interface WriteFile {
  file: string;
  content: string;
  index: number;
}

const utils = {} as Utils;

/**
 * Read content from file.
 *
 * @param {String} file
 * @returns {String}
 */
utils.readFile = (file: string) => fs.readFileSync(file, 'utf8');

/**
 * Write content into file.
 *
 * @param {String} file
 * @param {String} content
 * @param {Number} index - index of the file being processed
 * @returns {String}
 */
utils.writeFile = ({ file, content, index }: WriteFile) => {
  const _file = index !== undefined ? file[index] : file;
  if (!fs.existsSync(_file) || (fs.existsSync(_file) && !fs.lstatSync(_file).isDirectory())) {
    fs.writeFileSync(_file, content, 'utf8');
  }

  return content;
};

/**
 * Delete file.
 *
 * @param {String} file
 * @returns {String}
 */
utils.deleteFile = (file: string) => fs.unlinkSync(file);

/**
 * Builds arguments array based on an object.
 *
 * @param {Object} options
 * @returns {Array}
 */
interface Dictionary<T> {
  [Key: string]: T;
}
utils.buildArgs = (options: Dictionary<string | boolean>) => {
  const args: (string | boolean)[] = [];
  Object.keys(options).forEach((key: string) => {
    if (options[key] && options[key] !== false) {
      args.push('--' + key);
    }

    if (options[key] && options[key] !== true) {
      args.push(options[key]);
    }
  });

  return args;
};

/**
 * Clone an object.
 *
 * @param {Object} obj
 * @returns {Object}
 */
utils.clone = (obj: {}) => JSON.parse(JSON.stringify(obj));

/**
 * Get the file size in bytes.
 *
 * @returns {String}
 */
utils.getFilesizeInBytes = (file: string) => {
  const stats = fs.statSync(file);
  const fileSizeInBytes = stats.size;
  return utils.prettyBytes(fileSizeInBytes);
};

/**
 * Get the gzipped file size in bytes.
 *
 * @returns {Promise.<String>}
 */
utils.getFilesizeGzippedInBytes = (file: string) => {
  return new Promise(resolve => {
    const source = fs.createReadStream(file);
    source.pipe(gzipSize.stream()).on('gzip-size', size => {
      resolve(utils.prettyBytes(size));
    });
  });
};

/**
 * Get the size in human readable.
 * From https://github.com/sindresorhus/pretty-bytes
 *
 * @returns {String}
 */
utils.prettyBytes = (num: number) => {
  const UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  if (!Number.isFinite(num)) {
    throw new TypeError(`Expected a finite number, got ${typeof num}: ${num}`);
  }

  const neg = num < 0;

  if (neg) {
    num = -num;
  }

  if (num < 1) {
    return (neg ? '-' : '') + num + ' B';
  }

  const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), UNITS.length - 1);
  const numStr = Number((num / Math.pow(1000, exponent)).toPrecision(3));
  const unit = UNITS[exponent];

  return (neg ? '-' : '') + numStr + ' ' + unit;
};

/**
 * Set the file name as minified.
 * eg. file.js returns file.min.js
 *
 * @param {String} file
 * @param {String} output
 * @param {String} publicFolder
 * @param {Boolean} replaceInPlace
 * @returns {String}
 */
utils.setFileNameMin = (file: string, output: string, publicFolder: string, replaceInPlace: boolean) => {
  const filePath = file.substr(0, file.lastIndexOf('/') + 1);
  const fileWithoutPath = file.substr(file.lastIndexOf('/') + 1);
  let fileWithoutExtension = fileWithoutPath.substr(0, fileWithoutPath.lastIndexOf('.'));
  if (publicFolder) {
    fileWithoutExtension = publicFolder + fileWithoutExtension;
  }
  if (replaceInPlace) {
    fileWithoutExtension = filePath + fileWithoutExtension;
  }
  return output.replace('$1', fileWithoutExtension);
};

/**
 * Compress a single file.
 *
 * @param {Object} settings
 */
utils.compressSingleFile = (settings: MinifierOptions) => {
  const content = settings.content ? settings.content : utils.getContentFromFiles(settings.input);
  return settings.sync ? utils.runSync({ settings, content }) : utils.runAsync({ settings, content });
};

/**
 * Concatenate all input files and get the data.
 *
 * @param {String|Array} input
 * @return {String}
 */
utils.getContentFromFiles = (input: string) => {
  if (!Array.isArray(input)) {
    return fs.readFileSync(input, 'utf8');
  }

  return input
    .map(path =>
      !fs.existsSync(path) || (fs.existsSync(path) && !fs.lstatSync(path).isDirectory())
        ? fs.readFileSync(path, 'utf8')
        : ''
    )
    .join('\n');
};

/**
 * Run compressor in sync.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Number} index - index of the file being processed
 * @return {String}
 */
utils.runSync = ({ settings, content, index }: MinifierOptions) =>
  settings && typeof settings.compressor !== 'string'
    ? settings.compressor({ settings, content, callback: null, index })
    : null;

/**
 * Run compressor in async.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Number} index - index of the file being processed
 * @return {Promise}
 */
utils.runAsync = ({ settings, content, index }: MinifierOptions) => {
  return new Promise((resolve, reject) => {
    settings && typeof settings.compressor !== 'string'
      ? settings.compressor({
          settings,
          content,
          callback: (err: Error, min: string) => {
            if (err) {
              return reject(err);
            }
            resolve(min);
          },
          index
        })
      : null;
  });
};

/**
 * Expose `utils`.
 */
export { utils };

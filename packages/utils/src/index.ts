/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import { readFileSync, lstatSync, statSync, existsSync, writeFileSync, unlinkSync, createReadStream } from 'node:fs';
import gzipSize from 'gzip-size';
import { Dictionary, MinifierOptions, Settings, Options } from '@node-minify/types';

interface Utils {
  readFile: (file: string) => string;
  writeFile: ({ file, content, index }: WriteFile) => string;
  deleteFile: (file: string) => void;
  buildArgs: (
    options: Options & Dictionary<string | boolean | [] | { url: string } | { filename: string } | undefined>
  ) => any;
  clone: (obj: object) => object;
  getFilesizeInBytes: (file: string) => string;
  getFilesizeGzippedInBytes: (file: string) => Promise<string>;
  prettyBytes: (num: number) => string;
  setFileNameMin: (file: string, output: string, publicFolder: string, replaceInPlace: boolean) => string;
  compressSingleFile: (settings: Settings) => string | Promise<string>;
  getContentFromFiles: (input: string | string[]) => string;
  runSync: ({ settings, content, index }: MinifierOptions) => string;
  runAsync: ({ settings, content, index }: MinifierOptions) => Promise<string>;
}

interface WriteFile {
  file: string;
  content: any;
  index?: number;
}

const utils = {} as Utils;

/**
 * Read content from file.
 *
 * @param {String} file
 * @returns {String}
 */
utils.readFile = (file: string) => readFileSync(file, 'utf8');

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
  if (!existsSync(_file) || (existsSync(_file) && !lstatSync(_file).isDirectory())) {
    writeFileSync(_file, content, 'utf8');
  }

  return content;
};

/**
 * Delete file.
 *
 * @param {String} file
 * @returns {String}
 */
utils.deleteFile = (file: string) => unlinkSync(file);

/**
 * Builds arguments array based on an object.
 *
 * @param {Object} options
 * @returns {Array}
 */
utils.buildArgs = (options: Dictionary<string | boolean | [] | { url: string } | { filename: string } | undefined>) => {
  const args: (string | boolean | [] | { url: string } | { filename: string } | undefined)[] = [];
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
utils.clone = (obj: object) => JSON.parse(JSON.stringify(obj));

/**
 * Get the file size in bytes.
 *
 * @returns {String}
 */
utils.getFilesizeInBytes = (file: string) => {
  const stats = statSync(file);
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
    const source = createReadStream(file);
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
utils.compressSingleFile = (settings: Settings): Promise<string> | string => {
  const content = settings.content ? settings.content : settings.input ? utils.getContentFromFiles(settings.input) : '';
  return settings.sync ? utils.runSync({ settings, content }) : utils.runAsync({ settings, content });
};

/**
 * Concatenate all input files and get the data.
 *
 * @param {String|Array} input
 * @return {String}
 */
utils.getContentFromFiles = (input: string | string[]) => {
  if (!Array.isArray(input)) {
    return readFileSync(input, 'utf8');
  }

  return input
    .map(path =>
      !existsSync(path) || (existsSync(path) && !lstatSync(path).isDirectory()) ? readFileSync(path, 'utf8') : ''
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
utils.runSync = ({ settings, content, index }: MinifierOptions): string =>
  settings && typeof settings.compressor !== 'string'
    ? typeof settings.compressor === 'function'
      ? settings.compressor({ settings, content, callback: null, index })
      : ''
    : '';

/**
 * Run compressor in async.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Number} index - index of the file being processed
 * @return {Promise}
 */
utils.runAsync = ({ settings, content, index }: MinifierOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    settings && settings.compressor && typeof settings.compressor !== 'string'
      ? settings.compressor({
          settings,
          content,
          callback: (err: unknown, result?: string) => {
            if (err) {
              return reject(err);
            }
            resolve(result || '');
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

/*!
 * node-minify
 * Copyright(c) 2011-2020 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import fs from 'fs';
import gzipSize from 'gzip-size';

const utils = {};

/**
 * Read content from file.
 *
 * @param {String} file
 * @returns {String}
 */
utils.readFile = file => fs.readFileSync(file, 'utf8');

/**
 * Write content into file.
 *
 * @param {String} file
 * @param {String} content
 * @param {Number} index - index of the file being processed
 * @returns {String}
 */
utils.writeFile = ({ file, content, index }) => {
  const _file = index !== undefined ? file[index] : file;
  if (!fs.existsSync(_file) || (fs.existsSync(_file) && !fs.lstatSync(_file).isDirectory())) {
    fs.writeFileSync(_file, content, 'utf8');
  }

  return content;
};

/**
 * Builds arguments array based on an object.
 *
 * @param {Object} options
 * @returns {Array}
 */
utils.buildArgs = options => {
  const args = [];

  Object.keys(options).forEach(key => {
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
utils.clone = obj => JSON.parse(JSON.stringify(obj));

/**
 * Get the file size in bytes.
 *
 * @returns {String}
 */
utils.getFilesizeInBytes = file => {
  const stats = fs.statSync(file);
  const fileSizeInBytes = stats.size;
  return utils.prettyBytes(fileSizeInBytes);
};

/**
 * Get the gzipped file size in bytes.
 *
 * @returns {Promise.<String>}
 */
utils.getFilesizeGzippedInBytes = file => {
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
utils.prettyBytes = num => {
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
utils.setFileNameMin = (file, output, publicFolder, replaceInPlace) => {
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
utils.compressSingleFile = settings => {
  const content = settings.content ? settings.content : utils.getContentFromFiles(settings.input);
  return settings.sync ? utils.runSync({ settings, content }) : utils.runAsync({ settings, content });
};

/**
 * Concatenate all input files and get the data.
 *
 * @param {String|Array} input
 * @return {String}
 */
utils.getContentFromFiles = input => {
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
utils.runSync = ({ settings, content, index }) => settings.compressor({ settings, content, callback: null, index });

/**
 * Run compressor in async.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Number} index - index of the file being processed
 * @return {Promise}
 */
utils.runAsync = ({ settings, content, index }) => {
  return new Promise((resolve, reject) => {
    settings.compressor({
      settings,
      content,
      callback: (err, min) => {
        if (err) {
          return reject(err);
        }
        resolve(min);
      },
      index
    });
  });
};

/**
 * Expose `utils`.
 */
export { utils };

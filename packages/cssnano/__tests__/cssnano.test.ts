/*!
 * node-minify
 * Copyright(c) 2011-2023 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe, expect, test } from 'vitest';
import minify from '../../core/src';
import cssnano from '../src';
import { filesCSS } from '../../../tests/files-path';
import { runOneTest, tests } from '../../../tests/fixtures';
import { Options } from '../../../tests/types';

const compressorLabel = 'cssnano';
const compressor = cssnano;

describe('Package: cssnano', () => {
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commoncss.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
  test('should be ok with no callback', () => {
    const options: Options = {
      minify: {
        compressor: cssnano,
        input: filesCSS.fileCSS,
        output: filesCSS.fileCSSOut
      }
    };

    return minify(options.minify).then(min => {
      return expect(min).not.toBeNull();
    });
  });
  test('should throw an error', () => {
    const options: Options = {
      minify: {
        compressor: cssnano,
        input: filesCSS.fileCSSErrors,
        output: filesCSS.fileCSSOut,
        callback: (): void => {
          return;
        }
      }
    };

    return minify(options.minify).catch(err => {
      return expect(err).not.toBeNull();
    });
  });
});

import minify from '../packages/core/src/core';
import { filesJS, filesCSS, filesHTML } from './files-path';

const runOneTest = ({ options, compressorLabel, compressor, sync }) => {
  options = JSON.parse(JSON.stringify(options));

  options.minify.compressor = compressor;

  if (sync) {
    options.minify.sync = true;
  }

  test(options.it.replace('{compressor}', compressorLabel), done => {
    return new Promise(resolve => {
      options.minify.callback = (err, min) => {
        done();
        resolve(err, min);
      };

      minify(options.minify);
    }).then((err, min) => {
      done();
      expect(err).toBeNull();
      expect(min).not.toBeNull();
    });
  });
};

const tests = {
  concat: [
    {
      it: 'should concat javascript and no compress and an array of file',
      minify: {
        input: filesJS.filesArray,
        output: filesJS.fileJSOut
      }
    },
    {
      it: 'should concat javascript and no compress and a single file',
      minify: {
        input: filesJS.oneFile,
        output: filesJS.fileJSOut
      }
    }
  ],
  commoncss: [
    {
      it: 'should compress css with {compressor} and a single file',
      minify: {
        input: filesCSS.fileCSS,
        output: filesCSS.fileCSSOut,
        type: 'css'
      }
    },
    {
      it: 'should compress css with {compressor} and a single file with a custom public folder',
      minify: {
        input: filesCSS.fileCSSWithoutPath,
        output: filesCSS.fileCSSOut,
        type: 'css',
        publicFolder: filesCSS.publicFolderCSS
      }
    },
    {
      it: 'should compress css with {compressor} and a single file with a custom public folder and full path',
      minify: {
        input: filesCSS.fileCSS,
        output: filesCSS.fileCSSOut,
        type: 'css',
        publicFolder: filesCSS.publicFolderCSS
      }
    },
    {
      it: 'should compress css with {compressor} and a single file with a custom buffer size',
      minify: {
        input: filesCSS.fileCSS,
        output: filesCSS.fileCSSOut,
        type: 'css',
        buffer: 2000 * 1024
      }
    },
    {
      it: 'should compress css with {compressor} and a single file with some options',
      minify: {
        input: filesCSS.fileCSS,
        output: filesCSS.fileCSSOut,
        type: 'css',
        options: {
          charset: 'utf8'
        }
      }
    },
    {
      it: 'should compress css with {compressor} and an array of file',
      minify: {
        input: filesCSS.fileCSSArray,
        output: filesCSS.fileCSSOut,
        type: 'css'
      }
    },
    {
      it: 'should compress css with {compressor} and an array of file with a custom public folder',
      minify: {
        input: filesCSS.fileCSSArrayWithoutPath,
        output: filesCSS.fileCSSOut,
        type: 'css',
        publicFolder: filesCSS.publicFolderCSS
      }
    },
    {
      it: 'should compress css with {compressor} and an array of file with a custom buffer size',
      minify: {
        input: filesCSS.fileCSSArray,
        output: filesCSS.fileCSSOut,
        type: 'css',
        buffer: 2000 * 1024
      }
    },
    {
      it: 'should compress css with {compressor} and wildcards path',
      minify: {
        input: filesCSS.fileCSSWithWildcards,
        output: filesCSS.fileCSSOut,
        type: 'css'
      }
    },
    {
      it: 'should compress css with {compressor} and wildcards path with a custom public folder',
      minify: {
        input: '**/*.css',
        output: filesCSS.fileCSSOut,
        type: 'css',
        publicFolder: filesCSS.publicFolderCSS
      }
    },
    {
      it: 'should compress css with {compressor} and wildcards path with a custom buffer size',
      minify: {
        input: filesCSS.fileCSSWithWildcards,
        output: filesCSS.fileCSSOut,
        type: 'css',
        buffer: 2000 * 1024
      }
    },
    {
      it: 'should compress css with {compressor} and an array of strings and wildcards path',
      minify: {
        input: filesCSS.fileCSSArrayWithWildcards2,
        output: filesCSS.fileCSSOut,
        type: 'css'
      }
    },
    {
      it:
        'should compress css with {compressor} and an array of strings and wildcards path' +
        ' with a custom public folder',
      minify: {
        input: filesCSS.fileCSSArrayWithWildcards,
        output: filesCSS.fileCSSOut,
        type: 'css',
        publicFolder: filesCSS.publicFolderCSS
      }
    }
  ],
  commonjs: [
    {
      it: 'should compress javascript with {compressor} and a single file',
      minify: {
        input: filesJS.oneFile,
        output: filesJS.fileJSOut
      }
    },
    {
      it: 'should compress javascript with {compressor} and a single file and output $1',
      minify: {
        input: filesJS.oneFile,
        output: filesJS.fileJSOutReplace
      }
    },
    {
      it: 'should compress javascript with {compressor} and a single file with a custom public folder',
      minify: {
        input: filesJS.oneFileWithoutPath,
        output: filesJS.fileJSOut,
        publicFolder: filesJS.publicFolderES5
      }
    },
    {
      it: 'should compress javascript with {compressor} and a single file with a custom public folder and full path',
      minify: {
        input: filesJS.oneFile,
        output: filesJS.fileJSOut,
        publicFolder: filesJS.publicFolderES5
      }
    },
    {
      it: 'should compress javascript with {compressor} and a single file with a custom buffer size',
      minify: {
        input: filesJS.oneFile,
        output: filesJS.fileJSOut,
        buffer: 2000 * 1024
      }
    },
    {
      it: 'should compress javascript with {compressor} and a single file with empty options',
      minify: {
        input: filesJS.oneFile,
        output: filesJS.fileJSOut,
        options: {}
      }
    },
    {
      it: 'should compress javascript with {compressor} and an array of file',
      minify: {
        input: filesJS.filesArray,
        output: filesJS.fileJSOut
      }
    },
    {
      it: 'should compress javascript with {compressor} and an array of file and output $1',
      minify: {
        input: filesJS.filesArray,
        output: filesJS.fileJSOutReplace
      }
    },
    {
      it: 'should compress javascript with {compressor} and an array of file with a custom public folder',
      minify: {
        input: filesJS.filesArrayWithoutPath,
        output: filesJS.fileJSOut,
        publicFolder: filesJS.publicFolderES5
      }
    },
    {
      it: 'should compress javascript with {compressor} and an array of file with a custom buffer size',
      minify: {
        input: filesJS.filesArray,
        output: filesJS.fileJSOut,
        buffer: 2000 * 1024
      }
    },
    {
      it: 'should compress javascript with {compressor} and wildcards path',
      minify: {
        input: filesJS.oneFileWithWildcards,
        output: filesJS.fileJSOut
      }
    },
    {
      it: 'should compress javascript with {compressor} and wildcards path with a custom public folder',
      minify: {
        input: '**/*.js',
        output: filesJS.fileJSOut,
        publicFolder: filesJS.publicFolderES5
      }
    },
    {
      it: 'should compress javascript with {compressor} and wildcards path with a custom buffer size',
      minify: {
        input: filesJS.oneFileWithWildcards,
        output: filesJS.fileJSOut,
        buffer: 2000 * 1024
      }
    },
    {
      it: 'should compress javascript with {compressor} and an array of strings and wildcards path',
      minify: {
        input: filesJS.filesArrayWithWildcards2,
        output: filesJS.fileJSOut
      }
    },
    {
      it:
        'should compress javascript with {compressor} and an array of strings and wildcards path' +
        ' with a custom public folder',
      minify: {
        input: filesJS.filesArrayWithWildcards,
        output: filesJS.fileJSOut,
        publicFolder: filesJS.publicFolderES5
      }
    }
  ],
  babelMinify: [
    {
      it: 'should compress javascript with {compressor} and a single file with a babelrc',
      minify: {
        input: filesJS.oneFile,
        output: filesJS.fileJSOut,
        options: {
          babelrc: filesJS.babelrc
        }
      }
    },
    {
      it: 'should compress javascript with {compressor} and a single file with a preset',
      minify: {
        input: filesJS.oneFile,
        output: filesJS.fileJSOut,
        options: {
          presets: ['env']
        }
      }
    },
    {
      it: 'should compress javascript with {compressor} and a single file with a babelrc and preset',
      minify: {
        input: filesJS.oneFile,
        output: filesJS.fileJSOut,
        options: {
          babelrc: filesJS.babelrc,
          presets: ['env']
        }
      }
    },
    {
      it: 'should compress with {compressor} and some options',
      minify: {
        input: filesJS.oneFileWithWildcards,
        output: filesJS.fileJSOut,
        options: {
          charset: 'utf8'
        }
      }
    }
  ],
  uglifyjs: [
    {
      it: 'should create a source map with {compressor}',
      minify: {
        input: filesJS.oneFileWithWildcards,
        output: filesJS.fileJSOut,
        options: {
          sourceMap: {
            filename: `${filesJS.fileJSOut}.map`,
            url: `${filesJS.fileJSOut}.map`
          }
        }
      }
    },
    {
      it: 'should compress with some options with {compressor}',
      minify: {
        input: filesJS.oneFileWithWildcards,
        output: filesJS.fileJSOut,
        options: {
          mangle: false
        }
      }
    }
  ],
  commonhtml: [
    {
      it: 'should compress html with {compressor} and a single file',
      minify: {
        input: filesHTML.oneFileHTML,
        output: filesHTML.fileHTMLOut
      }
    },
    {
      it: 'should compress html with {compressor} and a single file with a custom public folder',
      minify: {
        input: filesHTML.oneFileHTMLWithoutPath,
        output: filesHTML.fileHTMLOut,
        publicFolder: filesHTML.publicFolderHTML
      }
    },
    {
      it: 'should compress html with {compressor} and a single file with empty options',
      minify: {
        input: filesHTML.oneFileHTML,
        output: filesHTML.fileHTMLOut,
        options: {}
      }
    },
    {
      it: 'should compress html with {compressor} and an array of file',
      minify: {
        input: filesHTML.filesHTMLArray,
        output: filesHTML.fileHTMLOut
      }
    },
    {
      it: 'should compress html with {compressor} and an array of file with a custom public folder',
      minify: {
        input: filesHTML.filesHTMLArrayWithoutPath,
        output: filesHTML.fileHTMLOut,
        publicFolder: filesHTML.publicFolderHTML
      }
    },
    {
      it: 'should compress javascript with {compressor} and wildcards path',
      minify: {
        input: filesHTML.fileHTMLWithWildcards,
        output: filesHTML.fileHTMLOut
      }
    },
    {
      it: 'should compress html with {compressor} and wildcards path with a custom public folder',
      minify: {
        input: '**/*.html',
        output: filesHTML.fileHTMLOut,
        publicFolder: filesHTML.publicFolderHTML
      }
    },
    {
      it: 'should compress html with {compressor} and an array of strings and wildcards path',
      minify: {
        input: filesHTML.filesHTMLArrayWithWildcards,
        output: filesHTML.fileHTMLOut
      }
    },
    {
      it:
        'should compress html with {compressor} and an array of strings and wildcards path' +
        ' with a custom public folder',
      minify: {
        input: filesHTML.filesHTMLArrayWithWildcards2,
        output: filesHTML.fileHTMLOut,
        publicFolder: filesHTML.publicFolderHTML
      }
    }
  ]
};

export { runOneTest, tests };

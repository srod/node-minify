<p align="center"><img src="https://raw.githubusercontent.com/srod/node-minify/main/static/node-minify.svg" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/@node-minify/utils"><img src="https://img.shields.io/npm/v/@node-minify/utils.svg" alt="npm version"></a>
  <a href="https://npmjs.org/package/@node-minify/utils"><img src="https://img.shields.io/npm/dm/@node-minify/utils.svg" alt="npm downloads"></a>
  <a href="https://github.com/srod/node-minify/actions"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsrod%2Fnode-minify%2Fbadge%3Fref%3Dmain&style=flat" /></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/main/graph/badge.svg" alt="code coverage"></a>
</p>

# @node-minify/utils

Shared utilities for [`node-minify`](https://github.com/srod/node-minify) compressor packages.

This package provides common file operations, argument building, and helper functions used internally by node-minify compressors.

## Installation

```bash
npm install @node-minify/utils
```

## Exported Functions

### File Operations

| Function | Description |
|----------|-------------|
| `readFile(filePath)` | Read file contents as a string |
| `writeFile({ file, content, index })` | Write content to a file |
| `deleteFile(file)` | Delete a file from the filesystem |
| `isValidFile(filePath)` | Check if a file exists and is readable |
| `getContentFromFiles(settings)` | Read and concatenate content from multiple files |

### File Size Utilities

| Function | Description |
|----------|-------------|
| `getFilesizeInBytes(filePath)` | Get human-readable file size (e.g., "1.5 kB") |
| `getFilesizeGzippedInBytes(content)` | Get human-readable gzipped size |
| `prettyBytes(bytes)` | Format bytes as human-readable string |

### Compression Helpers

| Function | Description |
|----------|-------------|
| `compressSingleFile(settings)` | Compress a single file using the configured compressor |
| `run(settings)` | Execute compression with the provided settings |
| `buildArgs(options)` | Build command line arguments from options object |
| `toBuildArgsOptions(options, definitions)` | Convert options to buildArgs format |
| `setFileNameMin(file, output, publicFolder, replaceInPlace)` | Generate output filename from input |

### Deprecation Warnings

| Function | Description |
|----------|-------------|
| `warnDeprecation(packageName, message)` | Display a deprecation warning (once per package) |
| `resetDeprecationWarnings()` | Reset warning state (useful for testing) |

## Usage Example

```ts
import { readFile, writeFile, getFilesizeInBytes } from '@node-minify/utils';

// Read a file
const content = await readFile('src/app.js');

// Write minified content
await writeFile({
  file: 'dist/app.min.js',
  content: minifiedContent,
  index: 0
});

// Get file size
const size = await getFilesizeInBytes('dist/app.min.js');
console.log(`Output size: ${size}`); // "Output size: 2.3 kB"
```

## License

[MIT](https://github.com/srod/node-minify/blob/main/LICENSE)

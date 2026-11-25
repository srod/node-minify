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
| `readFileAsync(filePath)` | Read file contents as a string |
| `writeFileAsync({ file, content, index })` | Write content to a file |
| `isValidFileAsync(filePath)` | Check if a file exists and is readable |
| `getContentFromFilesAsync(input)` | Read and concatenate content from multiple files |

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
| `setFileNameMin(file, output, publicFolder, replaceInPlace)` | Generate output filename from input |

### Deprecated (removed in v12)

These exports still work in v11, and none of them emits a new deprecation warning. Your editor shows them as deprecated.

| Export | Use instead |
|--------|-------------|
| `readFile` | `readFileAsync` |
| `writeFile` | `writeFileAsync` |
| `getContentFromFiles` | `getContentFromFilesAsync` |
| `isValidFile` | `isValidFileAsync` |
| `deleteFile` | `fs.promises.unlink` |
| `getSourceMapBoolean` | `extractSourceMapOption` |
| `tryResolveBuiltIn`, `tryResolveNpmPackage`, `tryResolveLocalFile` | `resolveCompressor` |
| `getKnownExportName` | `getCompressorEntry(name)?.exportName`, with the canonical name (it does not resolve aliases: use `"google-closure-compiler"`, not `"gcc"`) |
| `isLocalPath` | none (`resolveCompressor` accepts local paths) |
| `validateMinifyResult` | none (`run` already validates every compressor's result) |
| `buildArgs`, `toBuildArgsOptions`, `BuildArgsOptions` | none |
| `warnDeprecation`, `resetDeprecationWarnings` | none |
| `WildcardOptions.publicFolder` (the object form of `wildcards` options) | pass the public folder as a string: `wildcards(input, publicFolder)` |
| `WildcardOptions.ignore` | none |

## Usage Example

```ts
import { readFileAsync, writeFileAsync, getFilesizeInBytes } from '@node-minify/utils';

// Read a file
const content = await readFileAsync('src/app.js');

// Write minified content
await writeFileAsync({
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

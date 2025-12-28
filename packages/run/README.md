<p align="center"><img src="/static/node-minify.svg" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/@node-minify/run"><img src="https://img.shields.io/npm/v/@node-minify/run.svg"></a>
  <a href="https://npmjs.org/package/@node-minify/run"><img src="https://img.shields.io/npm/dm/@node-minify/run.svg"></a>
  <a href="https://github.com/srod/node-minify/actions"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsrod%2Fnode-minify%2Fbadge%3Fref%3Dmain&style=flat" /></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/main/graph/badge.svg"></a>
</p>

# @node-minify/run

Command execution wrapper for Java-based compressors in [`node-minify`](https://github.com/srod/node-minify).

This package provides utilities to spawn Java processes for compressors like YUI Compressor and Google Closure Compiler.

## Installation

```bash
npm install @node-minify/run
```

## Usage

```ts
import { runCommandLine } from '@node-minify/run';

const result = await runCommandLine({
  args: ['-jar', 'path/to/compiler.jar'],
  data: 'var foo = 1;'
});

console.log(result); // Minified output
```

## API

### `runCommandLine(params)`

Executes a Java command with the provided arguments and pipes data to stdin.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `params.args` | `string[]` | Command line arguments for the Java process |
| `params.data` | `string` | Content to minify (piped to stdin) |

#### Returns

`Promise<string>` - The minified content from stdout.

#### Throws

- `Error` if the Java process exits with a non-zero code
- `Error` if there's a process spawn error

## Requirements

- Java Runtime Environment (JRE) must be installed and available in PATH

## License

[MIT](https://github.com/srod/node-minify/blob/main/LICENSE)

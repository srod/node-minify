---
title: "CLI"
description: "Command line interface for node-minify"
---

You can compress files using the command line.

## Installation

```bash
npm install -g @node-minify/cli # OR yarn global add @node-minify/cli OR pnpm add -g @node-minify/cli OR bun add -g @node-minify/cli
```

## Usage

```bash
node-minify --compressor uglify-js --input 'input.js' --output 'output.js'
```

<img src="/static/cli.png" alt="cli" width={749} height={322} priority />

## Multiple Inputs

To compress multiple files, you can pass multiple `--input` (or `-i`) flags. Each value is treated as a single file path, which allows supporting paths that contain commas.

```bash
node-minify --compressor uglify-js --input 'file1.js' --input 'file2.js' --output 'bundle.min.js'
```

Alternatively, you can use wildcards (globs):

```bash
node-minify --compressor uglify-js --input 'src/**/*.js' --output 'bundle.min.js'
```

For programmatic usage, pass an array of file paths:

```js
await run({
  compressor: "terser",
  input: ["src/a.js", "src/b.js"],
  output: "dist/bundle.min.js",
});
```

## Options

You can pass an `option` as a JSON string to the compressor.

```bash
node-minify --compressor uglify-js --input 'input.js' --output 'output.js' --option '{"warnings": true, "mangle": false}'
```
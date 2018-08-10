# CLI

You can compress files using the command line.

## Usage

```bash
node-minify --compressor uglifyjs --input 'input.js' --output 'output.js'
```

<img src="../static/cli.png" width="749" height="322" alt="cli">

## Options

You can pass an `option` as a JSON string to the compressor.

```bash
node-minify --compressor uglifyjs --input 'input.js' --output 'output.js' --option '{"warnings": true, "mangle": false}'
```

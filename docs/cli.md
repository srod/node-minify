# CLI

You can compress files using the command line.

Usage for one or multiple compressors :

```bash
node-minify --compressor babel-minify --input 'input.js' --output 'output.js'
```

```bash
node-minify --compressor 'babel-minify, uglifyjs, gcc' --input 'input.js' --output 'output.js'
```

Usage for all the compressors :

```bash
node-minify --compressor all --input 'input.js' --output 'output.js'
```

<img src="../static/cli.png" width="784" height="433" alt="cli">

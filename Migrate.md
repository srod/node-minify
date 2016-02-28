# Node-minify migration from v1 to v2

## Config changes

- No need to instantiate anymore

```new compressor.minify()``` to ```compressor.minify()```

- type was renamed to compressor

```{ type: 'gcc' }``` to ```{ compressor: 'gcc' }```

- fileIn was renamed to input

```{ fileIn: 'foo.js' }``` to ```{ input: 'foo.js' }```

- fileOut was renamed to output

```{ fileOut: 'bar.js' }``` to ```{ output: 'bar.js' }```

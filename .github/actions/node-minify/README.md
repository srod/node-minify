# node-minify GitHub Action (DEPRECATED)

> **This action is deprecated.** Please use the new bundled action instead:
>
> ```yaml
> - uses: srod/node-minify@v1
> ```

The new action includes:
- Bundled dependencies (faster startup)
- PR comment reporting
- File annotations
- Benchmark comparison
- Threshold enforcement
- More compressor options

## Migration

Replace:

```yaml
- uses: srod/node-minify/.github/actions/node-minify@main
  with:
    input: "src/app.js"
    output: "dist/app.min.js"
    compressor: "terser"
```

With:

```yaml
- uses: srod/node-minify@v1
  with:
    input: "src/app.js"
    output: "dist/app.min.js"
    compressor: "terser"
```

See [packages/action/README.md](../../../packages/action/README.md) for full documentation.

---

## Legacy Documentation

The following documentation is for the deprecated composite action.

### Basic Example

```yaml
- name: Minify JavaScript
  uses: srod/node-minify/.github/actions/node-minify@main
  with:
    input: "src/app.js"
    output: "dist/app.min.js"
    compressor: "terser"
```

### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `input` | Files to minify (glob pattern or path) | Yes | - |
| `output` | Output file path | Yes | - |
| `compressor` | Compressor to use | No | `terser` |
| `type` | File type: js, css, or html | No | - |
| `options` | Compressor options (JSON) | No | `{}` |
| `report-summary` | Add results to job summary | No | `true` |
| `include-gzip` | Include gzip sizes | No | `true` |
| `java-version` | Java version for gcc/yui | No | - |

### Outputs

| Output | Description |
|--------|-------------|
| `original-size` | Original size in bytes |
| `original-size-formatted` | Original size formatted (e.g., 45.2 kB) |
| `minified-size` | Minified size in bytes |
| `minified-size-formatted` | Minified size formatted |
| `reduction-percent` | Size reduction percentage |
| `gzip-size` | Gzipped size in bytes |
| `gzip-size-formatted` | Gzipped size formatted |
| `time-ms` | Compression time in milliseconds |

## License

MIT

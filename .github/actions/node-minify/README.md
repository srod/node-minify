# node-minify GitHub Action

Minify JavaScript, CSS, and HTML files in your CI/CD pipeline with detailed reporting.

## Usage

### Basic Example

```yaml
- name: Minify JavaScript
  uses: srod/node-minify/.github/actions/node-minify@main
  with:
    input: "src/app.js"
    output: "dist/app.min.js"
    compressor: "terser"
```

### With All Options

```yaml
- name: Minify with full options
  id: minify
  uses: srod/node-minify/.github/actions/node-minify@main
  with:
    input: "src/app.js"
    output: "dist/app.min.js"
    compressor: "esbuild"
    type: "js"
    options: '{"minify": true}'
    report-summary: "true"
    include-gzip: "true"

- name: Show results
  run: |
    echo "Reduction: ${{ steps.minify.outputs.reduction-percent }}%"
```

## Inputs

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

### Available Compressors

**JavaScript (no Java required):**
- `terser` (recommended)
- `esbuild` (fastest)
- `swc`
- `oxc`
- `uglify-js`

**CSS (no Java required):**
- `lightningcss` (recommended)
- `clean-css`
- `cssnano`
- `csso`
- `esbuild`

**HTML:**
- `html-minifier`

**Requires Java:**
- `gcc` (Google Closure Compiler)
- `yui` (deprecated)

## Outputs

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

## Examples

### CSS Minification

```yaml
- name: Minify CSS
  uses: srod/node-minify/.github/actions/node-minify@main
  with:
    input: "src/styles.css"
    output: "dist/styles.min.css"
    compressor: "lightningcss"
    type: "css"
```

### Using Google Closure Compiler

```yaml
- name: Setup Java
  uses: actions/setup-java@v4
  with:
    distribution: "temurin"
    java-version: "17"

- name: Minify with GCC
  uses: srod/node-minify/.github/actions/node-minify@main
  with:
    input: "src/app.js"
    output: "dist/app.min.js"
    compressor: "gcc"
    options: '{"compilation_level": "ADVANCED_OPTIMIZATIONS"}'
```

### HTML Minification

```yaml
- name: Minify HTML
  uses: srod/node-minify/.github/actions/node-minify@main
  with:
    input: "src/index.html"
    output: "dist/index.html"
    compressor: "html-minifier"
```

## License

MIT

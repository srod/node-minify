# @node-minify/action

GitHub Action for minifying JavaScript, CSS, and HTML files with detailed reporting.

## Features

- 📦 **Minification** - Compress JS, CSS, HTML files using 15+ compressors
- 📊 **Job Summary** - Detailed compression statistics in workflow UI
- 💬 **PR Comments** - Automatic size reports on pull requests
- ⚠️ **Annotations** - File-level warnings for low compression
- 🎯 **Thresholds** - Fail builds on size regressions
- 🏁 **Benchmark** - Compare compressor performance

## Usage

### Prerequisites

Compressor packages contain native dependencies that cannot be bundled into the action. You must install the compressor package you want to use before running the action:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: "20"

- name: Install compressor
  run: npm install @node-minify/terser

- name: Minify JavaScript
  uses: srod/node-minify@v1
  with:
    input: "src/app.js"
    output: "dist/app.min.js"
    compressor: "terser"
```

### Basic Minification

```yaml
- name: Minify JavaScript
  uses: srod/node-minify@v1
  with:
    input: "src/app.js"
    output: "dist/app.min.js"
    compressor: "terser"
```

### With PR Comment

```yaml
- name: Minify and Report
  uses: srod/node-minify@v1
  with:
    input: "src/app.js"
    output: "dist/app.min.js"
    compressor: "esbuild"
    type: "js"
    report-summary: true
    report-pr-comment: true
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### With Thresholds

```yaml
- name: Minify with Quality Gates
  uses: srod/node-minify@v1
  with:
    input: "src/app.js"
    output: "dist/app.min.js"
    compressor: "terser"
    fail-on-increase: true
    min-reduction: 50
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `input` | Files to minify (glob pattern or path) | Yes | - |
| `output` | Output file path | Yes | - |
| `compressor` | Compressor to use | No | `terser` |
| `type` | File type: js or css | No | - |
| `options` | Compressor options (JSON) | No | `{}` |
| `report-summary` | Add results to job summary | No | `true` |
| `report-pr-comment` | Post results as PR comment | No | `false` |
| `report-annotations` | Add file annotations | No | `false` |
| `fail-on-increase` | Fail if size increases | No | `false` |
| `min-reduction` | Minimum reduction % | No | `0` |
| `include-gzip` | Include gzip sizes | No | `true` |
| `github-token` | Token for PR comments | No | - |

### Available Compressors

**JavaScript:**
- `terser` (recommended)
- `esbuild` (fastest, requires `type: js`)
- `swc`
- `oxc`
- `uglify-js`
- `google-closure-compiler` / `gcc` (requires Java)

**CSS:**
- `lightningcss` (recommended, CSS-only)
- `clean-css`
- `cssnano`
- `csso`
- `esbuild` (requires `type: css`)

**HTML:**
- `html-minifier`
- `minify-html`

**JSON:**
- `jsonminify`

**Image:**
- `sharp` (WebP/AVIF conversion)
- `svgo` (SVG optimization)
- `imagemin` (PNG/JPEG/GIF)

**Other:**
- `no-compress` (passthrough, concatenation only)

**Deprecated (emit warnings):**
- `babel-minify` → use `terser`
- `uglify-es` → use `terser`
- `yui` → use `terser` (JS) or `lightningcss` (CSS)
- `crass` → use `lightningcss` or `clean-css`
- `sqwish` → use `lightningcss` or `clean-css`

## Outputs

| Output | Description |
|--------|-------------|
| `original-size` | Original size in bytes |
| `minified-size` | Minified size in bytes |
| `reduction-percent` | Size reduction percentage |
| `gzip-size` | Gzipped size in bytes |
| `time-ms` | Compression time in ms |
| `report-json` | Full report as JSON |
| `benchmark-winner` | Best compressor from benchmark (if run) |
| `best-compression` | Compressor with best compression ratio (if benchmark run) |
| `best-speed` | Fastest compressor (if benchmark run) |
| `benchmark-json` | Full benchmark results as JSON string |

## License

MIT

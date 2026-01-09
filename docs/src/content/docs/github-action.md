---
title: "GitHub Action"
description: "Use node-minify in your CI/CD pipelines with the official GitHub Action"
---

Minify JavaScript, CSS, and HTML files directly in your GitHub workflows with detailed reporting.

## Features

- Bundled dependencies (fast startup)
- PR comment reporting
- Job summary with compression stats
- File annotations for warnings
- Benchmark comparison across compressors
- Threshold enforcement (fail on size increase)
- Support for 22+ compressors

## Quick Start

```yaml
- name: Minify JavaScript
  uses: srod/node-minify@v1
  with:
    input: "src/app.js"
    output: "dist/app.min.js"
    compressor: "terser"
```

## Usage Examples

### Basic Minification

```yaml
name: Build
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Minify JS
        uses: srod/node-minify@v1
        with:
          input: "src/app.js"
          output: "dist/app.min.js"
          compressor: "terser"
```

### With PR Comments

```yaml
- name: Minify and Report
  uses: srod/node-minify@v1
  with:
    input: "src/app.js"
    output: "dist/app.min.js"
    compressor: "esbuild"
    type: "js"
    report-summary: "true"
    report-pr-comment: "true"
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### CSS Minification

```yaml
- name: Minify CSS
  uses: srod/node-minify@v1
  with:
    input: "src/styles.css"
    output: "dist/styles.min.css"
    compressor: "lightningcss"
    type: "css"
```

### With Quality Gates

```yaml
- name: Minify with Thresholds
  uses: srod/node-minify@v1
  with:
    input: "src/app.js"
    output: "dist/app.min.js"
    compressor: "terser"
    fail-on-increase: "true"
    min-reduction: "20"
```

### Benchmark Comparison

```yaml
- name: Benchmark Compressors
  uses: srod/node-minify@v1
  with:
    input: "src/app.js"
    output: "dist/app.min.js"
    compressor: "terser"
    benchmark: "true"
    benchmark-compressors: "terser,esbuild,swc,oxc"
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `input` | Files to minify (glob pattern or path) | Yes | - |
| `output` | Output file path | Yes | - |
| `compressor` | Compressor to use | No | `terser` |
| `type` | File type: `js` or `css` | No | - |
| `options` | Compressor options (JSON) | No | `{}` |
| `report-summary` | Add results to job summary | No | `true` |
| `report-pr-comment` | Post results as PR comment | No | `false` |
| `report-annotations` | Add file annotations | No | `false` |
| `benchmark` | Run benchmark comparison | No | `false` |
| `benchmark-compressors` | Compressors to compare | No | `terser,esbuild,swc,oxc` |
| `fail-on-increase` | Fail if size increases | No | `false` |
| `min-reduction` | Minimum reduction % (0-100) | No | `0` |
| `include-gzip` | Include gzip sizes | No | `true` |
| `working-directory` | Working directory | No | `.` |
| `github-token` | Token for PR comments | No | - |

### Type Parameter

The `type` parameter is **required** for:
- `esbuild` (specify `js` or `css`)
- `lightningcss` (specify `css`)
- `yui` (specify `js` or `css`)

### Available Compressors

**JavaScript:**
- `terser` (recommended)
- `esbuild` (fastest, requires `type: js`)
- `swc`
- `oxc`
- `uglify-js`
- `google-closure-compiler` / `gcc` (requires Java)

**CSS:**
- `lightningcss` (recommended, requires `type: css`)
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
- `no-compress` (passthrough)

## Outputs

| Output | Description |
|--------|-------------|
| `original-size` | Original size in bytes |
| `minified-size` | Minified size in bytes |
| `reduction-percent` | Size reduction percentage |
| `gzip-size` | Gzipped size in bytes |
| `time-ms` | Compression time in ms |
| `report-json` | Full report as JSON |
| `benchmark-winner` | Best compressor (if benchmark run) |

### Using Outputs

```yaml
- name: Minify
  id: minify
  uses: srod/node-minify@v1
  with:
    input: "src/app.js"
    output: "dist/app.min.js"
    compressor: "terser"

- name: Show Results
  run: |
    echo "Original: ${{ steps.minify.outputs.original-size }} bytes"
    echo "Minified: ${{ steps.minify.outputs.minified-size }} bytes"
    echo "Reduction: ${{ steps.minify.outputs.reduction-percent }}%"
```

## Advanced Examples

### Google Closure Compiler

```yaml
- name: Setup Java
  uses: actions/setup-java@v4
  with:
    distribution: "temurin"
    java-version: "17"

- name: Minify with GCC
  uses: srod/node-minify@v1
  with:
    input: "src/app.js"
    output: "dist/app.min.js"
    compressor: "gcc"
    options: '{"compilation_level": "ADVANCED_OPTIMIZATIONS"}'
```

### HTML Minification

```yaml
- name: Minify HTML
  uses: srod/node-minify@v1
  with:
    input: "src/index.html"
    output: "dist/index.html"
    compressor: "html-minifier"
    options: '{"collapseWhitespace": true, "removeComments": true}'
```

### Multiple Files

```yaml
- name: Minify JS bundle
  uses: srod/node-minify@v1
  with:
    input: "src/**/*.js"
    output: "dist/bundle.min.js"
    compressor: "terser"

- name: Minify CSS bundle
  uses: srod/node-minify@v1
  with:
    input: "src/**/*.css"
    output: "dist/styles.min.css"
    compressor: "lightningcss"
    type: "css"
```

## Job Summary

When `report-summary` is enabled (default), the action adds a detailed summary to your workflow run showing:

- Input/output files
- Original and minified sizes
- Compression percentage
- Gzip size
- Processing time

## PR Comments

Enable `report-pr-comment` to automatically post compression results as a comment on pull requests. Requires `github-token` to be set.

## Deprecation Notices

The following compressors are deprecated and will emit warnings:

| Deprecated | Use Instead |
|------------|-------------|
| `babel-minify` | `terser` |
| `uglify-es` | `terser` |
| `yui` | `terser` (JS) or `lightningcss` (CSS) |
| `crass` | `lightningcss` or `clean-css` |
| `sqwish` | `lightningcss` or `clean-css` |

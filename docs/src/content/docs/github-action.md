---
title: "GitHub Action"
description: "Use node-minify in your CI/CD pipelines with the official GitHub Action"
---

Minify JavaScript, CSS, and HTML files directly in your GitHub workflows with detailed reporting.

## Features

- 📦 **Minification** - Compress JS, CSS, HTML files using 15+ compressors
- 📊 **Job Summary** - Detailed compression statistics in workflow UI
- 💬 **PR Comments** - Automatic size reports with base branch comparison
- 📈 **Size Tracking** - See before/after changes vs base branch
- ⚠️ **Annotations** - File-level warnings for low compression
- 🎯 **Thresholds** - Fail builds on size regressions
- 🏁 **Benchmark** - Compare compressor performance

## Zero-Config Mode

Enable automatic file discovery and compressor selection with `auto: true`. The action scans standard directories (`src/`, `app/`, `lib/`, `styles/`), detects file types, and applies appropriate compressors automatically.

### How It Works

1. **File Discovery**: Scans project for JS, CSS, HTML, JSON, and SVG files
2. **Type Detection**: Determines file type from extension
3. **Compressor Selection**: Chooses optimal compressor per file type
4. **Parallel Processing**: Minifies files concurrently with concurrency limit
5. **Grouped Results**: Summary organized by file type

### Default Behavior

**Included Directories**:
- `src/**/*.{js,mjs,cjs,jsx,css,html,htm,json,svg}`
- `app/**/*.{js,mjs,cjs,jsx,css,html,htm,json,svg}`
- `lib/**/*.{js,mjs,cjs,jsx,css,html,htm,json,svg}`
- `styles/**/*.{css}`
- Root-level `*.{js,css,html,json,svg}`

**Excluded By Default**:
- `**/node_modules/**`
- `**/dist/**`, `**/build/**`, `**/.next/**`
- `**/*.min.{js,css}` (already minified)
- `**/__tests__/**` (test files)
- `**/.*` (hidden files)
- `**/*.d.ts` (TypeScript declarations)

**Note**: TypeScript files (`.ts`, `.tsx`) are excluded. Minifiers operate on compiled JavaScript, not TypeScript source. Compile first, then minify.

### Required Compressor Packages

| File Type | Default Compressor | Required Package |
|-----------|-------------------|------------------|
| JavaScript (`.js`, `.mjs`, `.cjs`, `.jsx`) | terser | `@node-minify/terser` |
| CSS (`.css`) | lightningcss | `@node-minify/lightningcss` |
| HTML (`.html`, `.htm`) | html-minifier | `@node-minify/html-minifier` |
| JSON (`.json`) | jsonminify | `@node-minify/jsonminify` |
| SVG (`.svg`) | svgo | `@node-minify/svgo` |

**Install only the compressors you need** based on your project's file types.

### Basic Usage

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'

# Install compressors for your file types
- name: Install compressors
  run: |
    npm install @node-minify/terser @node-minify/lightningcss

- name: Minify all files
  uses: srod/node-minify@v1
  with:
    auto: 'true'
```

Output files preserve directory structure in `dist/`:
- `src/app.js` → `dist/src/app.js`
- `src/styles.css` → `dist/src/styles.css`

### Custom Patterns

Override default patterns to target specific files:

```yaml
- name: Minify custom locations
  uses: srod/node-minify@v1
  with:
    auto: 'true'
    patterns: 'public/**/*.js,assets/**/*.css'
    output-dir: 'build'
```

### Custom Ignore Patterns

Add additional ignore patterns (merges with defaults):

```yaml
- name: Minify with custom ignores
  uses: srod/node-minify@v1
  with:
    auto: 'true'
    ignore: '**/*.config.js,**/vendor/**'
```

### Dry-Run Mode

Preview which files would be processed without minifying:

```yaml
- name: Preview auto mode
  uses: srod/node-minify@v1
  with:
    auto: 'true'
    dry-run: 'true'
```

Check the job summary or logs to see discovered files.

### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `auto` | Enable zero-config mode | No | `false` |
| `patterns` | Custom glob patterns (comma-separated) | No | Standard directories |
| `output-dir` | Output directory | No | `dist` |
| `ignore` | Additional ignore patterns (comma-separated) | No | - |
| `dry-run` | Preview mode - discover files without processing | No | `false` |

### Example: Mixed Project

For a project with JavaScript, CSS, and HTML:

```yaml
- name: Install all compressors
  run: |
    npm install \
      @node-minify/terser \
      @node-minify/lightningcss \
      @node-minify/html-minifier

- name: Minify all assets
  uses: srod/node-minify@v1
  with:
    auto: 'true'
    output-dir: 'public/dist'
```

## Quick Start

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

> **Note:** Compressor packages contain native dependencies that cannot be bundled. You must install the compressor package before running the action.

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

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install compressor
        run: npm install @node-minify/terser

      - name: Minify JS
        uses: srod/node-minify@v1
        with:
          input: "src/app.js"
          output: "dist/app.min.js"
          compressor: "terser"
```

### With PR Comments

When enabled, PR comments include a **"vs Base"** column showing size changes compared to the base branch:

| File | Original | Minified | Reduction | vs Base |
|------|----------|----------|-----------|---------|
| `app.min.js` | 45.2 kB | 12.3 kB | 72.8% | -1.6% ✅ |
| `utils.min.js` | 23.1 kB | 8.2 kB | 64.5% | +2.5% ⚠️ |

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
- name: Install compressor
  run: npm install @node-minify/lightningcss

- name: Minify CSS
  uses: srod/node-minify@v1
  with:
    input: "src/styles.css"
    output: "dist/styles.min.css"
    compressor: "lightningcss"
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

Compare multiple compressors to find the best one for your project:

```yaml
- name: Install compressors
  run: npm install @node-minify/terser @node-minify/esbuild @node-minify/swc @node-minify/oxc

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
| `fail-on-increase` | Fail if size increases vs base | No | `false` |
| `min-reduction` | Minimum reduction % (0-100) | No | `0` |
| `include-gzip` | Include gzip sizes | No | `true` |
| `working-directory` | Working directory | No | `.` |
| `github-token` | Token for PR comments | No | - |

### Type Parameter

The `type` parameter is **required** for:
- `esbuild` (specify `js` or `css`)
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
- `lightningcss` (recommended)
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
| `best-compression` | Compressor with best ratio (if benchmark run) |
| `best-speed` | Fastest compressor (if benchmark run) |
| `benchmark-json` | Full benchmark results as JSON |

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

- name: Install compressor
  run: npm install @node-minify/google-closure-compiler

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
- name: Install compressor
  run: npm install @node-minify/html-minifier

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
- name: Install compressors
  run: npm install @node-minify/terser @node-minify/lightningcss

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
```

### Full CI/CD Integration

```yaml
name: Build and Deploy
on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      
      - name: Install dependencies
        run: npm install @node-minify/esbuild
      
      - name: Build
        run: npm run build
      
      - name: Minify Assets
        id: minify
        uses: srod/node-minify@v1
        with:
          input: "dist/**/*.js"
          compressor: "esbuild"
          type: "js"
          output: "dist/"
          report-summary: "true"
          report-pr-comment: ${{ github.event_name == 'pull_request' }}
          report-annotations: "true"
          include-gzip: "true"
          fail-on-increase: "true"
          github-token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Upload Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: minified-assets
          path: dist/
      
      - name: Deploy
        if: github.ref == 'refs/heads/main'
        run: echo "Deploy minified assets (reduction: ${{ steps.minify.outputs.reduction-percent }}%)"
```

## Job Summary

When `report-summary` is enabled (default), the action adds a detailed summary to your workflow run showing:

- Input/output files
- Original and minified sizes
- Compression percentage
- Gzip size
- Processing time

## PR Comments

Enable `report-pr-comment` to automatically post compression results as a comment on pull requests. The comment includes:

- Compression statistics for each file
- **Base branch comparison** showing size changes (e.g., "-1.6% ✅" or "+2.5% ⚠️")
- Total size and reduction across all files

Requires `github-token` to be set.

## Deprecation Notices

The following compressors are deprecated and will emit warnings:

| Deprecated | Use Instead |
|------------|-------------|
| `babel-minify` | `terser` |
| `uglify-es` | `terser` |
| `yui` | `terser` (JS) or `lightningcss` (CSS) |
| `crass` | `lightningcss` or `clean-css` |
| `sqwish` | `lightningcss` or `clean-css` |

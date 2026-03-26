---
title: Upgrading to v11
description: Migration guide for node-minify v11
---

Node-minify v11 introduces breaking changes to modernize the library, improve performance, and reduce the maintenance burden of legacy compressors.

## Removed Compressors

The following compressors have been removed. If you use them, switch to the recommended alternatives.

| Removed Package | Recommended Replacement |
| :--- | :--- |
| `babel-minify` | `terser` |
| `uglify-es` | `terser` |
| `yui` | `terser` (JS) or `lightningcss` (CSS) |
| `sqwish` | `lightningcss` |
| `crass` | `lightningcss` |

## Type Alias Removals

TypeScript users must update the following type aliases:

- `CompressorReturnType` is now `CompressorResult`
- `MinifyOptions` is now `Settings`

## Support Tiers

We now categorize compressors into four tiers to clarify their maintenance status.

### Recommended
Modern, high-performance compressors. Use these for new projects.
- **JS**: `terser`, `esbuild`, `swc`, `oxc`
- **CSS**: `lightningcss`, `esbuild`
- **HTML**: `html-minifier`, `minify-html`
- **Images**: `sharp`, `svgo`

### Supported
Stable compressors with active maintenance.
- `clean-css`, `cssnano`, `csso`, `uglify-js`, `jsonminify`, `imagemin`

### Legacy
Functional but not recommended for new projects. May be removed in future versions.
- `google-closure-compiler`, `no-compress`

### Removed
No longer available in v11.
- `babel-minify`, `uglify-es`, `yui`, `sqwish`, `crass`

## Google Closure Compiler Backend Change

The `google-closure-compiler` compressor now uses the official npm JS API instead of a custom Java wrapper. While this simplifies the dependency chain, it does not guarantee zero Java usage in every upstream execution path, as some parts of GCC may still rely on the JVM.

## Preferred Replacements by Asset Type

| Asset Type | Recommended Compressors |
| :--- | :--- |
| **JS** | `terser`, `oxc`, `swc`, `esbuild` |
| **CSS** | `lightningcss`, `cssnano` |
| **HTML** | `minify-html` |
| **Images** | `sharp`, `svgo` |

## Automated Migration Check

You can use the `node-minify doctor` command to automatically scan your project for deprecated or removed compressors and receive migration advice.

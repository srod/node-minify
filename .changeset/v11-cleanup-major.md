---
"@node-minify/core": major
---

v11: cleanup major release.

### Breaking changes

- **Minimum Node.js is now 22**: `engines.node` moved from `>=20.0.0` to `>=22.0.0` across all packages. Node 20 reached end-of-life on 2026-04-30 and is no longer covered by CI (the test matrix runs 22.x and 24.x). Upgrade to Node 22 or later.
- **Removed 5 deprecated compressor packages**: `@node-minify/babel-minify`, `@node-minify/uglify-es`, `@node-minify/yui`, `@node-minify/sqwish`, `@node-minify/crass`. Use the recommended replacements (terser/oxc/swc/esbuild for JS, lightningcss/cssnano for CSS).
- **Removed `@node-minify/run`**: internal Java/process-spawn helper, no longer used by any compressor.
- **Removed deprecated type aliases** from `@node-minify/types`: `CompressorReturnType` (use `CompressorResult`) and `MinifyOptions` (use `Settings`).
- **Google Closure Compiler now uses the `google-closure-compiler` npm API** instead of invoking the Java JAR through `@node-minify/run`. Same flags and output. Note: the npm package still bundles `google-closure-compiler-java`, so Java may still be invoked under the hood — this change removes node-minify's custom Java plumbing, not Java itself.

### New features

- **Compressor support tiers**: shared status registry in `@node-minify/utils` (`recommended` / `supported` / `legacy` / `removed`), surfaced in CLI help and the GitHub Action.
- **`node-minify doctor`**: read-only CLI command covering every v11 break. Scans `package.json`, source imports, `compressor:` values and workflow YAML for removed/legacy compressors, the removed `@node-minify/run` package, the removed `CompressorReturnType`/`MinifyOptions` type aliases, and `engines.node` ranges that still allow Node below 22. Exits non-zero on errors so it can gate CI.
- **CLI and Action fail early** when a removed compressor is requested, pointing at the replacement.
- **GCC runtime controls**: configurable `buffer` limit (kills the child process when stdout/stderr exceeds it) plus hardened process/timeout/error handling.

### Migration

See the [v11 migration guide](https://github.com/srod/node-minify/blob/main/docs/src/content/docs/guides/v11-migration.md), or run `npx --package=@node-minify/cli -- node-minify doctor` in your project.

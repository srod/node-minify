---
"@node-minify/utils": minor
---

Add `resolveCompressor` utility for dynamic compressor loading

- Resolves built-in @node-minify compressors by name (e.g., "terser", "esbuild")
- Supports npm packages as custom compressors
- Supports local file paths (e.g., "./my-compressor.js")
- Intelligent export detection: known export, camelCase name, 'compressor', default, or first function
- Also exports `isBuiltInCompressor` and `getKnownExportName` helpers

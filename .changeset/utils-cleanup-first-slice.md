---
"@node-minify/utils": patch
"@node-minify/cssnano": patch
"@node-minify/oxc": patch
"@node-minify/minify-html": patch
"@node-minify/no-compress": patch
---

Internal cleanup with no change to output or reported sizes.

- `cssnano`, `oxc` and `minify-html` no longer run `validateMinifyResult` on their own result, because `run` already validates it and the libraries always return a string.
- `no-compress` uses `ensureStringContent`. Array content (several image files) now throws `no-compress compressor does not support array content` instead of `no-compress failed: content must be a string or Buffer but received object`.
- `@node-minify/utils` builds only its `index` entry, because the package exports map only exposes `.`. The exported names are unchanged.
- The gzip and brotli size helpers check the file with `isValidFileAsync` instead of the deprecated `isValidFile`.

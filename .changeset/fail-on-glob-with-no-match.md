---
"@node-minify/core": patch
---

Fail when no input file is left after glob expansion.

`minify()` used to resolve with an empty string and write nothing when a wildcard input such as `src/**/*.js` matched nothing and the output used `$1`; with a plain output it failed with `No content provided`. Both cases now throw `No files matched input pattern: <pattern>`. An array where at least one entry matches keeps working, and unmatched globs in it are skipped as before. Explicit empty arrays and in-memory `content` are unaffected.

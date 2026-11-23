---
"@node-minify/core": patch
---

Fail when an `input` glob matches no file.

`minify()` used to resolve with an empty string and write nothing when a wildcard input such as `src/**/*.js` matched nothing and the output used `$1`; with a plain output it failed with `No content provided`. Both cases now throw `No files matched input pattern: <pattern>`. Explicit empty arrays and in-memory `content` are unaffected.

---
"@node-minify/oxc": patch
---

Fix the oxc compressor ignoring parse errors reported by `oxc-minify`.

A JavaScript syntax error used to surface as `No content provided`, or as a silent success when `allowEmptyOutput` was set. It now fails with `oxc minification failed: <oxc's message>`.

---
"@node-minify/utils": patch
"@node-minify/cli": patch
"@node-minify/benchmark": patch
---

Drop the `gzip-size` and `chalk` dependencies in favor of Node built-ins, with no change to reported sizes or output.

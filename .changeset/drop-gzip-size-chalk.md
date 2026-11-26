---
"@node-minify/utils": patch
"@node-minify/cli": patch
"@node-minify/benchmark": patch
---

Drop the `gzip-size` and `chalk` dependencies in favor of Node built-ins. Reported gzip and brotli sizes are unchanged (gzip still uses level 9, as `gzip-size` did), and so is terminal output, with two exceptions: the CLI now honors `NO_COLOR`, and on Node 22.0–22.7 redirected CLI output can contain color codes (benchmark files written with `--output` are still stripped).

---
"@node-minify/core": patch
"@node-minify/utils": patch
---

fix: normalize cross-platform path handling in core and utils

Improves Windows/POSIX path compatibility for output directory resolution, wildcard handling, and public folder/minified path generation.

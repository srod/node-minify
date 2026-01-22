---
"@node-minify/types": minor
"@node-minify/utils": minor
"@node-minify/cli": minor
---

feat: add `allowEmptyOutput` option to skip writing empty output files

When minifiers produce empty output (e.g., CSS files with only comments), the new `allowEmptyOutput` option allows gracefully skipping the file write instead of throwing a validation error. Also adds `--allow-empty-output` CLI flag.

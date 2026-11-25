---
"@node-minify/action": patch
---

Internal cleanup, no change to behavior.

- The explicit and auto modes share one per-file minify-and-measure step and one reporting sequence.
- The Action uses `DEFAULT_IGNORES` from `@node-minify/utils` instead of its own copy.
- `benchmark-compressors` is parsed with the same helper as the other comma-separated inputs.

---
"@node-minify/benchmark": patch
"@node-minify/cli": patch
"@node-minify/core": patch
"@node-minify/sharp": patch
---

Internal cleanup, no change to output.

- `benchmark` measures each gzip and brotli size once instead of twice. The reported sizes are unchanged.
- `cli` prints the three compressor tiers in `--help` from one loop. The text is unchanged from before this cleanup.
- `core` validates the entries of an array `input` once, in `setup`, instead of a second time before compressing.
- `sharp` no longer caches the lazily imported `sharp` module itself, because Node already does.

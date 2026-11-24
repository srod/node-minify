---
"@node-minify/utils": minor
"@node-minify/cli": patch
"@node-minify/action": patch
"@node-minify/benchmark": patch
---

Removed compressors (such as `yui`) now fail the same way everywhere, including `resolveCompressor`, with one message naming the replacement. The benchmark now reports the resolver's actual error for a compressor it cannot load instead of "Compressor not found or not installed". `@node-minify/utils` also exports a `CompressorName` type, and `COMPRESSOR_REGISTRY` is now the single compressor list read by the CLI, the Action, the resolver, the benchmark and `doctor`.

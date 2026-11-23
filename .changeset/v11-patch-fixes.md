---
"@node-minify/core": patch
"@node-minify/types": patch
"@node-minify/sharp": patch
"@node-minify/cli": patch
"@node-minify/benchmark": patch
---

- `@node-minify/core`, `@node-minify/types`: Stop supplying a hidden 1 MB default `buffer` in `setup()`, allowing Google Closure Compiler to use its own 100 MB per-stream limit unless a caller specifies `buffer` (custom compressors reading `settings.buffer` must now handle `undefined`).
- `@node-minify/sharp`: Await `converter.toBuffer()` inside `try` so async encoding failures report the target format (`Sharp conversion to <format> failed: …`) in both single-format and multi-format runs.
- `@node-minify/cli`: Remove duplicate `Compression failed:` error wrapping in `compress()` so failed CLI runs print the prefix once.
- `@node-minify/benchmark`: Write temporary benchmark outputs to an isolated `os.tmpdir()` directory removed in `finally` instead of next to the input file.
- `@node-minify/benchmark`, `@node-minify/cli`: Honor `output` / `-o` and `format` / `-f` by writing the formatted benchmark report to disk (creating parent directories and stripping ANSI escape codes) instead of printing to stdout, and enable Commander positional options so `-c`, `-o`, and `-t` reach the `benchmark` subcommand. Root-only flags such as `-s`, `-O` or `-i` placed after `benchmark` had no effect on it and are now rejected as unknown options.

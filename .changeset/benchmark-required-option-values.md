---
"@node-minify/cli": patch
---

`node-minify benchmark`: `-c`, `-n`, `-f`, `-o` and `-t` now require a value. A bare `-o` used to run the whole benchmark and then crash on `path.dirname(true)`, and a bare `-c` crashed on `split`; both are now rejected up front with "argument missing".

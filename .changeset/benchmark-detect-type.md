---
"@node-minify/benchmark": patch
"@node-minify/cli": patch
---

`benchmark` detects the file type from each input file's extension when `type` is not given, so `node-minify benchmark src/app.js -c terser,esbuild` no longer reports esbuild as failed with `You must specify a type: js or css`. `.js .mjs .cjs .jsx` give `js`, `.css` gives `css`, `.html .htm` give `html`. An explicit `type` still wins, and other extensions pass no type as before. The `benchmark -t` help text says so.

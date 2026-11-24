---
"@node-minify/utils": minor
"@node-minify/cli": minor
---

`csso`, `imagemin` and `uglify-js` move from the supported tier to the legacy tier, because they are removed in v12. `node-minify doctor` now warns that each is removed in v12 and names its replacement (`lightningcss` or `cssnano`, `sharp` or `svgo` for SVG, and `terser`), and the compressor list in `node-minify --help` says the same. `jsonminify` moves from the legacy tier back to the supported tier, since v12 keeps it, so `doctor` no longer warns about it. All four keep working in v11, and nothing extra is printed when you run them. In `@node-minify/utils`, `getCompressorsByStatus` and `COMPRESSOR_REGISTRY` return the new tiers, and a legacy entry with a `replacement` is removed in the next major version.

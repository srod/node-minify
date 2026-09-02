---
"@node-minify/minify-html": patch
---

Fix `minify-html` throwing `minifyHtmlLib.minify is not a function` at runtime.

`@minify-html/node` is a CommonJS native addon, so under Node's ESM loader its exports are reachable only through the default export. The compressor called `minify` off the namespace object, which is always `undefined` there, making the package fail on every input when consumed from real Node.

The bug was masked in CI: the error test mocked `@minify-html/node` with a flat `{ minify }` shape that does not match the real module, and Vitest's CommonJS interop resolved the namespace differently than Node does. The mock now mirrors the real default-export shape, and a regression test asserts the interop directly.

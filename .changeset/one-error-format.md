---
"@node-minify/utils": minor
"@node-minify/terser": patch
"@node-minify/esbuild": patch
"@node-minify/swc": patch
"@node-minify/lightningcss": patch
"@node-minify/uglify-js": patch
"@node-minify/svgo": patch
"@node-minify/sharp": patch
"@node-minify/imagemin": patch
---

Every built-in compressor now reports a minification failure as `<compressor> minification failed: <original message>`, with the original error as its `cause`. Input checks that run before minifying keep their own messages, such as esbuild's `You must specify a type: js or css` and sharp's and imagemin's `requires Buffer content`. `terser`, `esbuild`, `swc`, `lightningcss`, `uglify-js`, `svgo`, `sharp` and `imagemin` used to throw the library's error as it was or with their own wording (`SVGO optimization failed:`, `Sharp conversion to webp failed:`, `Imagemin returned no output`), so code that matched on that text or on the error's class (for example `instanceof SyntaxError` for lightningcss) should read `error.cause` instead. `@node-minify/utils` also exports `FileOperationError` and `ValidationError`, and `wrapMinificationError` takes an optional `context` string.

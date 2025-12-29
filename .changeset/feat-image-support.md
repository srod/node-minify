---
"@node-minify/sharp": minor
"@node-minify/svgo": minor
"@node-minify/imagemin": minor
"@node-minify/utils": patch
"@node-minify/types": patch
"@node-minify/core": patch
---

feat: Add image compression support

New packages:
- `@node-minify/sharp`: Convert and compress images to WebP, AVIF, PNG, JPEG using sharp
- `@node-minify/svgo`: Optimize SVG files using SVGO
- `@node-minify/imagemin`: Compress PNG, JPEG, GIF images using imagemin

Core changes:
- Support for binary (Buffer) content in compressors
- Multi-format output support (e.g., convert PNG to both WebP and AVIF)
- New `buffer` and `outputs` fields in CompressorResult type

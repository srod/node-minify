---
"@node-minify/sharp": minor
---

Add `gif` as an output format, as `format: "gif"` or inside `formats`. This gives `@node-minify/imagemin` users, which is removed in v12, a GIF path in v11. sharp re-encodes the image with libvips instead of optimizing the GIF losslessly like gifsicle, so output sizes differ from imagemin's. Animated GIFs keep all their frames. `effort` (1-10, default 7) is the only option that applies to GIF. Other output formats are unchanged.

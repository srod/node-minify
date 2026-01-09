# @node-minify/imagemin

## 10.3.0

### Patch Changes

- Updated dependencies [1e06c03]
  - @node-minify/utils@10.3.0
  - @node-minify/core@10.3.0

## 10.2.0

### Minor Changes

- 3c98739: feat: Add image compression support

  New packages:

  - `@node-minify/sharp`: Convert and compress images to WebP, AVIF, PNG, JPEG using sharp
  - `@node-minify/svgo`: Optimize SVG files using SVGO
  - `@node-minify/imagemin`: Compress PNG, JPEG, GIF images using imagemin

  Core changes:

  - Support for binary (Buffer) content in compressors
  - Multi-format output support (e.g., convert PNG to both WebP and AVIF)
  - New `buffer` and `outputs` fields in CompressorResult type

### Patch Changes

- Updated dependencies [3c98739]
  - @node-minify/utils@10.2.0
  - @node-minify/core@10.2.0

## 10.0.0

### Major Changes

- Initial release of imagemin compression plugin
- Support for JPEG compression via mozjpeg
- Support for PNG compression via pngquant
- Support for GIF compression via gifsicle
- Quality, effort, and optimization level options

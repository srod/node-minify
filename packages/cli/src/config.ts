/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

export const AVAILABLE_MINIFIER = [
    // JavaScript compressors
    { name: "esbuild", export: "esbuild" },
    { name: "google-closure-compiler", export: "gcc" },
    { name: "oxc", export: "oxc" },
    { name: "swc", export: "swc" },
    { name: "terser", export: "terser" },
    { name: "uglify-js", export: "uglifyJs" },
    // Deprecated JS compressors
    { name: "babel-minify", export: "babelMinify" },
    { name: "uglify-es", export: "uglifyEs" },
    { name: "yui", export: "yui" },
    // CSS compressors
    { name: "clean-css", export: "cleanCss", cssOnly: true },
    { name: "cssnano", export: "cssnano", cssOnly: true },
    { name: "csso", export: "csso", cssOnly: true },
    { name: "lightningcss", export: "lightningCss", cssOnly: true },
    // Deprecated CSS compressors
    { name: "crass", export: "crass", cssOnly: true },
    { name: "sqwish", export: "sqwish", cssOnly: true },
    // HTML compressors
    { name: "html-minifier", export: "htmlMinifier" },
    // JSON compressors
    { name: "jsonminify", export: "jsonMinify" },
    // Image compressors
    { name: "imagemin", export: "imagemin", binaryOnly: true },
    { name: "sharp", export: "sharp", binaryOnly: true },
    { name: "svgo", export: "svgo" },
    // Other
    { name: "no-compress", export: "noCompress" },
] as const;

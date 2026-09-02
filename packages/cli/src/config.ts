/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
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
    // CSS compressors
    { name: "clean-css", export: "cleanCss", cssOnly: true },
    { name: "cssnano", export: "cssnano", cssOnly: true },
    { name: "csso", export: "csso", cssOnly: true },
    { name: "lightningcss", export: "lightningCss", cssOnly: true },
    // HTML compressors
    { name: "html-minifier", export: "htmlMinifier" },
    { name: "minify-html", export: "minifyHtml" },
    // JSON compressors
    { name: "jsonminify", export: "jsonMinify" },
    // Image compressors
    { name: "imagemin", export: "imagemin" },
    { name: "sharp", export: "sharp" },
    { name: "svgo", export: "svgo" },
    // Other
    { name: "no-compress", export: "noCompress" },
] as const;

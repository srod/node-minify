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
    { name: "clean-css", export: "cleanCss" },
    { name: "cssnano", export: "cssnano" },
    { name: "csso", export: "csso" },
    { name: "lightningcss", export: "lightningCss" },
    // Deprecated CSS compressors
    { name: "crass", export: "crass" },
    { name: "sqwish", export: "sqwish" },
    // HTML compressors
    { name: "html-minifier", export: "htmlMinifier" },
    // JSON compressors
    { name: "jsonminify", export: "jsonMinify" },
    // Other
    { name: "no-compress", export: "noCompress" },
] as const;

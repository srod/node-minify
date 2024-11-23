export const AVAILABLE_MINIFIER = [
    { name: "babel-minify", export: "babelMinify" },
    { name: "csso", export: "csso" },
    { name: "google-closure-compiler", export: "gcc" },
    { name: "html-minifier", export: "htmlMinifier" },
    { name: "terser", export: "terser" },
    { name: "uglify-js", export: "uglifyJs" },
    { name: "uglify-es", export: "uglifyEs" },
    { name: "yui", export: "yui" },
] as const;

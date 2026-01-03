export const SITE = {
    title: "node-minify",
    description: "Documentation for node-minify",
    defaultLanguage: "en-us",
} as const;

export type Sidebar = Record<string, { text: string; link: string }[]>;
export const SIDEBAR: Sidebar = {
    "": [
        { text: "Introduction", link: "introduction" },
        { text: "Getting Started", link: "getting-started" },
        { text: "Custom Compressors", link: "custom-compressors" },
        { text: "Options", link: "options" },
        { text: "CLI", link: "cli" },
        { text: "Benchmark", link: "benchmark" },
    ],
    Compressors: [
        { text: "babel-minify", link: "compressors/babel-minify" },
        { text: "clean-css", link: "compressors/clean-css" },
        { text: "crass", link: "compressors/crass" },
        { text: "cssnano", link: "compressors/cssnano" },
        { text: "csso", link: "compressors/csso" },
        { text: "esbuild", link: "compressors/esbuild" },
        { text: "gcc", link: "compressors/gcc" },
        { text: "html-minifier", link: "compressors/html-minifier" },
        { text: "imagemin", link: "compressors/imagemin" },
        { text: "jsonminify", link: "compressors/jsonminify" },
        { text: "lightningcss", link: "compressors/lightningcss" },
        { text: "oxc", link: "compressors/oxc" },
        { text: "sharp", link: "compressors/sharp" },
        { text: "sqwish", link: "compressors/sqwish" },
        { text: "svgo", link: "compressors/svgo" },
        { text: "swc", link: "compressors/swc" },
        { text: "terser", link: "compressors/terser" },
        { text: "uglify-es", link: "compressors/uglify-es" },
        { text: "uglify-js", link: "compressors/uglify-js" },
        { text: "yui", link: "compressors/yui" },
    ],
};

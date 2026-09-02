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
        { text: "GitHub Action", link: "github-action" },
        { text: "Benchmark", link: "benchmark" },
    ],
    Compressors: [
        { text: "clean-css", link: "compressors/clean-css" },
        { text: "cssnano", link: "compressors/cssnano" },
        { text: "csso", link: "compressors/csso" },
        { text: "esbuild", link: "compressors/esbuild" },
        { text: "gcc", link: "compressors/gcc" },
        { text: "html-minifier", link: "compressors/html-minifier" },
        { text: "imagemin", link: "compressors/imagemin" },
        { text: "jsonminify", link: "compressors/jsonminify" },
        { text: "lightningcss", link: "compressors/lightningcss" },
        { text: "minify-html", link: "compressors/minify-html" },
        { text: "no-compress", link: "compressors/no-compress" },
        { text: "oxc", link: "compressors/oxc" },
        { text: "sharp", link: "compressors/sharp" },
        { text: "svgo", link: "compressors/svgo" },
        { text: "swc", link: "compressors/swc" },
        { text: "terser", link: "compressors/terser" },
        { text: "uglify-js", link: "compressors/uglify-js" },
    ],
    Guides: [{ text: "Upgrading to v11", link: "guides/v11-migration" }],
};

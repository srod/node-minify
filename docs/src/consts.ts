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
        { text: "Options", link: "options" },
        { text: "CLI", link: "cli" },
    ],
    Compressors: [
        { text: "babel-minify", link: "compressors/babel-minify" },
        { text: "clean-css", link: "compressors/clean-css" },
        { text: "crass", link: "compressors/crass" },
        { text: "cssnano", link: "compressors/cssnano" },
        { text: "csso", link: "compressors/csso" },
        { text: "gcc", link: "compressors/gcc" },
        { text: "html-minifier", link: "compressors/html-minifier" },
        { text: "jsonminify", link: "compressors/jsonminify" },
        { text: "sqwish", link: "compressors/sqwish" },
        { text: "terser", link: "compressors/terser" },
        { text: "uglify-es", link: "compressors/uglify-es" },
        { text: "uglify-js", link: "compressors/uglify-js" },
        { text: "yui", link: "compressors/yui" },
    ],
};

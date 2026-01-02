/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { Compressor } from "@node-minify/types";

const COMPRESSOR_EXPORTS: Record<string, string> = {
    esbuild: "esbuild",
    "google-closure-compiler": "gcc",
    oxc: "oxc",
    swc: "swc",
    terser: "terser",
    "uglify-js": "uglifyJs",
    "babel-minify": "babelMinify",
    "uglify-es": "uglifyEs",
    yui: "yui",
    "clean-css": "cleanCss",
    cssnano: "cssnano",
    csso: "csso",
    lightningcss: "lightningCss",
    crass: "crass",
    sqwish: "sqwish",
    "html-minifier": "htmlMinifier",
    jsonminify: "jsonMinify",
    imagemin: "imagemin",
    sharp: "sharp",
    svgo: "svgo",
    "no-compress": "noCompress",
};

/**
 * Load a compressor implementation from the corresponding @node-minify scoped package.
 *
 * @param name - Compressor package identifier (without the `@node-minify/` scope), e.g. `"esbuild"`
 * @returns The resolved `Compressor` export from the package, or `null` if the package or export cannot be loaded
 */
export async function loadCompressor(name: string): Promise<Compressor | null> {
    try {
        const packageName = `@node-minify/${name}`;
        const mod = await import(packageName);
        const exportName = COMPRESSOR_EXPORTS[name];
        if (exportName) {
            return mod[exportName] ?? mod.default;
        }
        return mod.default ?? null;
    } catch {
        return null;
    }
}
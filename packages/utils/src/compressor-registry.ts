/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Status of a compressor in the node-minify ecosystem.
 */
export type CompressorStatus =
    | "recommended"
    | "supported"
    | "legacy"
    | "removed";

/**
 * Entry in the compressor registry.
 */
export interface CompressorEntry {
    /** Compressor name (e.g., "terser", "babel-minify") */
    name: string;
    /** Current status in the ecosystem */
    status: CompressorStatus;
    /** NPM package name (e.g., "@node-minify/terser") */
    packageName: string;
    /** Recommended replacement for removed compressors */
    replacement?: string;
}

/**
 * Static registry of all compressors in node-minify v11.
 * Covers 22 compressors across JS, CSS, HTML, JSON, image, and passthrough use cases.
 */
export const COMPRESSOR_REGISTRY = [
    // Recommended (9)
    {
        name: "terser",
        status: "recommended",
        packageName: "@node-minify/terser",
    },
    { name: "oxc", status: "recommended", packageName: "@node-minify/oxc" },
    { name: "swc", status: "recommended", packageName: "@node-minify/swc" },
    {
        name: "esbuild",
        status: "recommended",
        packageName: "@node-minify/esbuild",
    },
    {
        name: "lightningcss",
        status: "recommended",
        packageName: "@node-minify/lightningcss",
    },
    {
        name: "cssnano",
        status: "recommended",
        packageName: "@node-minify/cssnano",
    },
    {
        name: "minify-html",
        status: "recommended",
        packageName: "@node-minify/minify-html",
    },
    { name: "sharp", status: "recommended", packageName: "@node-minify/sharp" },
    { name: "svgo", status: "recommended", packageName: "@node-minify/svgo" },
    // Supported (6)
    {
        name: "clean-css",
        status: "supported",
        packageName: "@node-minify/clean-css",
    },
    { name: "csso", status: "supported", packageName: "@node-minify/csso" },
    {
        name: "uglify-js",
        status: "supported",
        packageName: "@node-minify/uglify-js",
    },
    {
        name: "google-closure-compiler",
        status: "supported",
        packageName: "@node-minify/google-closure-compiler",
    },
    {
        name: "imagemin",
        status: "supported",
        packageName: "@node-minify/imagemin",
    },
    {
        name: "html-minifier",
        status: "supported",
        packageName: "@node-minify/html-minifier",
    },
    // Legacy (2)
    {
        name: "jsonminify",
        status: "legacy",
        packageName: "@node-minify/jsonminify",
    },
    {
        name: "no-compress",
        status: "legacy",
        packageName: "@node-minify/no-compress",
    },
    // Removed (5)
    {
        name: "babel-minify",
        status: "removed",
        packageName: "@node-minify/babel-minify",
        replacement: "terser",
    },
    {
        name: "uglify-es",
        status: "removed",
        packageName: "@node-minify/uglify-es",
        replacement: "terser",
    },
    {
        name: "yui",
        status: "removed",
        packageName: "@node-minify/yui",
        replacement: "terser or lightningcss",
    },
    {
        name: "sqwish",
        status: "removed",
        packageName: "@node-minify/sqwish",
        replacement: "lightningcss",
    },
    {
        name: "crass",
        status: "removed",
        packageName: "@node-minify/crass",
        replacement: "lightningcss",
    },
] as const;

/**
 * Get all compressors with a specific status.
 *
 * @param status - The status to filter by
 * @returns Array of compressor entries matching the status
 */
export function getCompressorsByStatus(
    status: CompressorStatus
): CompressorEntry[] {
    return COMPRESSOR_REGISTRY.filter((entry) => entry.status === status);
}

/**
 * Get a compressor entry by name.
 *
 * @param name - The compressor name to look up
 * @returns The compressor entry, or undefined if not found
 */
export function getCompressorEntry(name: string): CompressorEntry | undefined {
    return COMPRESSOR_REGISTRY.find((entry) => entry.name === name);
}

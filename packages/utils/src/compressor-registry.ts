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
    /** Additional notes about the compressor */
    notes?: string;
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
        notes: "Modern, fast, well-maintained JS minifier",
    },
    {
        name: "oxc",
        status: "recommended",
        packageName: "@node-minify/oxc",
        notes: "Rust-based, cutting-edge JS minifier",
    },
    {
        name: "swc",
        status: "recommended",
        packageName: "@node-minify/swc",
        notes: "Rust-based, very fast JS minifier",
    },
    {
        name: "esbuild",
        status: "recommended",
        packageName: "@node-minify/esbuild",
        notes: "Extremely fast, handles JS and CSS",
    },
    {
        name: "lightningcss",
        status: "recommended",
        packageName: "@node-minify/lightningcss",
        notes: "Rust-based, fastest CSS minifier",
    },
    {
        name: "cssnano",
        status: "recommended",
        packageName: "@node-minify/cssnano",
        notes: "PostCSS-based, customizable CSS minifier",
    },
    {
        name: "minify-html",
        status: "recommended",
        packageName: "@node-minify/minify-html",
        notes: "Fast HTML minifier",
    },
    {
        name: "sharp",
        status: "recommended",
        packageName: "@node-minify/sharp",
        notes: "WebP/AVIF conversion, high performance",
    },
    {
        name: "svgo",
        status: "recommended",
        packageName: "@node-minify/svgo",
        notes: "SVG optimization",
    },
    // Supported (6)
    {
        name: "clean-css",
        status: "supported",
        packageName: "@node-minify/clean-css",
        notes: "Feature-rich, reliable CSS minifier",
    },
    {
        name: "csso",
        status: "supported",
        packageName: "@node-minify/csso",
        notes: "Structural CSS optimizations",
    },
    {
        name: "uglify-js",
        status: "supported",
        packageName: "@node-minify/uglify-js",
        notes: "Classic, battle-tested JS minifier",
    },
    {
        name: "google-closure-compiler",
        status: "supported",
        packageName: "@node-minify/google-closure-compiler",
        notes: "Advanced optimizations via the google-closure-compiler npm API; may still invoke Java upstream",
    },
    {
        name: "imagemin",
        status: "supported",
        packageName: "@node-minify/imagemin",
        notes: "PNG/JPEG/GIF compression",
    },
    {
        name: "html-minifier",
        status: "supported",
        packageName: "@node-minify/html-minifier",
        notes: "HTML minification",
    },
    // Legacy (2)
    {
        name: "jsonminify",
        status: "legacy",
        packageName: "@node-minify/jsonminify",
        notes: "JSON minification",
    },
    {
        name: "no-compress",
        status: "legacy",
        packageName: "@node-minify/no-compress",
        notes: "Passthrough compressor used for concatenation and unknown types",
    },
    // Removed (5)
    {
        name: "babel-minify",
        status: "removed",
        packageName: "@node-minify/babel-minify",
        replacement: "terser",
        notes: "Babel 6 no longer maintained",
    },
    {
        name: "uglify-es",
        status: "removed",
        packageName: "@node-minify/uglify-es",
        replacement: "terser",
        notes: "Superseded by terser",
    },
    {
        name: "yui",
        status: "removed",
        packageName: "@node-minify/yui",
        replacement: "terser or lightningcss",
        notes: "YUI Compressor no longer maintained",
    },
    {
        name: "sqwish",
        status: "removed",
        packageName: "@node-minify/sqwish",
        replacement: "lightningcss",
        notes: "Replaced by modern CSS minifiers",
    },
    {
        name: "crass",
        status: "removed",
        packageName: "@node-minify/crass",
        replacement: "lightningcss",
        notes: "Replaced by modern CSS minifiers",
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

/**
 * Check if a compressor has been removed.
 *
 * @param name - The compressor name to check
 * @returns True if the compressor status is "removed", false otherwise
 */
export function isRemovedCompressor(name: string): boolean {
    const entry = getCompressorEntry(name);
    return entry?.status === "removed";
}

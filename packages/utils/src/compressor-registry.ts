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
    /**
     * Recommended replacement. On a removed compressor it is the compressor to use instead.
     * On a legacy compressor it means the compressor is removed in the next major (v12).
     */
    replacement?: string;
    /** Name of the function the package exports (e.g., "lightningCss"). Set on every non-removed entry. */
    exportName?: string;
    /** `true` when the compressor only accepts CSS input */
    cssOnly?: boolean;
    /** Friendly alternative names that resolve to this compressor (e.g., "gcc") */
    aliases?: readonly string[];
}

/**
 * Shape each registry entry must satisfy: a removed entry names its replacement,
 * and every other entry names the function its package exports. A legacy entry
 * may also name a replacement, which marks it as removed in v12.
 */
type RegistryEntry =
    | (CompressorEntry & { status: "removed"; replacement: string })
    | (CompressorEntry & {
          status: Exclude<CompressorStatus, "removed">;
          exportName: string;
      });

/**
 * Static registry of all compressors in node-minify v11.
 * Covers 22 compressors across JS, CSS, HTML, JSON, image, and passthrough use cases.
 *
 * This is the single compressor list. The resolver, the CLI's CSS-only check and
 * compressor list, and `doctor` read from it. The default compressors picked by
 * the CLI, the Action and the benchmark stay in their own files, typed
 * `CompressorName`, so renaming or removing an entry here fails typecheck there.
 */
export const COMPRESSOR_REGISTRY = [
    // Recommended (9)
    {
        name: "terser",
        status: "recommended",
        packageName: "@node-minify/terser",
        exportName: "terser",
    },
    {
        name: "oxc",
        status: "recommended",
        packageName: "@node-minify/oxc",
        exportName: "oxc",
    },
    {
        name: "swc",
        status: "recommended",
        packageName: "@node-minify/swc",
        exportName: "swc",
    },
    {
        name: "esbuild",
        status: "recommended",
        packageName: "@node-minify/esbuild",
        exportName: "esbuild",
    },
    {
        name: "lightningcss",
        status: "recommended",
        packageName: "@node-minify/lightningcss",
        exportName: "lightningCss",
        cssOnly: true,
    },
    {
        name: "cssnano",
        status: "recommended",
        packageName: "@node-minify/cssnano",
        exportName: "cssnano",
        cssOnly: true,
    },
    {
        name: "minify-html",
        status: "recommended",
        packageName: "@node-minify/minify-html",
        exportName: "minifyHtml",
    },
    {
        name: "sharp",
        status: "recommended",
        packageName: "@node-minify/sharp",
        exportName: "sharp",
    },
    {
        name: "svgo",
        status: "recommended",
        packageName: "@node-minify/svgo",
        exportName: "svgo",
    },
    // Supported (4)
    {
        name: "clean-css",
        status: "supported",
        packageName: "@node-minify/clean-css",
        exportName: "cleanCss",
        cssOnly: true,
    },
    {
        name: "google-closure-compiler",
        status: "supported",
        packageName: "@node-minify/google-closure-compiler",
        exportName: "gcc",
        aliases: ["gcc"],
    },
    {
        name: "html-minifier",
        status: "supported",
        packageName: "@node-minify/html-minifier",
        exportName: "htmlMinifier",
    },
    {
        name: "jsonminify",
        status: "supported",
        packageName: "@node-minify/jsonminify",
        exportName: "jsonMinify",
    },
    // Legacy (4): csso, imagemin and uglify-js are removed in v12 (they carry a replacement)
    {
        name: "csso",
        status: "legacy",
        packageName: "@node-minify/csso",
        exportName: "csso",
        cssOnly: true,
        replacement: "lightningcss or cssnano",
    },
    {
        name: "uglify-js",
        status: "legacy",
        packageName: "@node-minify/uglify-js",
        exportName: "uglifyJs",
        replacement: "terser",
    },
    {
        name: "imagemin",
        status: "legacy",
        packageName: "@node-minify/imagemin",
        exportName: "imagemin",
        replacement: "sharp, or svgo for SVG",
    },
    {
        name: "no-compress",
        status: "legacy",
        packageName: "@node-minify/no-compress",
        exportName: "noCompress",
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
] as const satisfies readonly RegistryEntry[];

/**
 * Name of a compressor that is still shipped (every registry entry that is not removed).
 * Renaming or removing a registry entry makes any stale use of its name fail typecheck.
 */
export type CompressorName = Exclude<
    (typeof COMPRESSOR_REGISTRY)[number],
    { status: "removed" }
>["name"];

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
 * Get a compressor entry by its name or its scoped package name.
 *
 * @param name - The compressor name (e.g. "yui") or package name (e.g. "@node-minify/yui")
 * @returns The compressor entry, or undefined if not found
 */
export function getCompressorEntry(name: string): CompressorEntry | undefined {
    return COMPRESSOR_REGISTRY.find(
        (entry) => entry.name === name || entry.packageName === name
    );
}

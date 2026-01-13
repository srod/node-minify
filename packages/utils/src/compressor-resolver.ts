/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Compressor } from "@node-minify/types";

/**
 * Known compressor exports for built-in @node-minify packages.
 * Maps package name to the exported function name.
 */
const KNOWN_COMPRESSOR_EXPORTS: Record<string, string> = {
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
    "minify-html": "minifyHtml",
    jsonminify: "jsonMinify",
    imagemin: "imagemin",
    sharp: "sharp",
    svgo: "svgo",
    "no-compress": "noCompress",
};

/**
 * Result from resolving a compressor.
 */
export type CompressorResolution = {
    /**
     * The resolved compressor function.
     */
    compressor: Compressor;

    /**
     * Label for the compressor (used in logs/reports).
     */
    label: string;

    /**
     * Whether this is a built-in @node-minify compressor.
     */
    isBuiltIn: boolean;
};

/**
 * Determines whether a string represents a local file path.
 *
 * @param name - The path string to test
 * @returns `true` if `name` appears to be a local file path, `false` otherwise
 */
export function isLocalPath(name: string): boolean {
    return (
        name.startsWith("./") ||
        name.startsWith("../") ||
        name.startsWith("/") ||
        /^[a-zA-Z]:[/\\]/.test(name)
    );
}

/**
 * Converts a package name to camelCase for export lookup.
 *
 * @param name - The package or file name to convert
 * @returns The input `name` converted to camelCase
 */
function toCamelCase(name: string): string {
    return name.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
}

/**
 * Resolve a compressor function exported by a loaded module.
 *
 * @param mod - The imported module object to inspect for exports
 * @param name - The package or file name used to derive known and camelCase export names
 * @returns The resolved `Compressor` function if found, or `null` if no suitable function export exists
 */
function extractCompressor(
    mod: Record<string, unknown>,
    name: string
): Compressor | null {
    const knownExport = KNOWN_COMPRESSOR_EXPORTS[name];
    if (knownExport && typeof mod[knownExport] === "function") {
        return mod[knownExport] as Compressor;
    }

    const baseName = name.includes("/")
        ? (name.split("/").pop() ?? name)
        : name;
    const camelName = toCamelCase(baseName);
    if (typeof mod[camelName] === "function") {
        return mod[camelName] as Compressor;
    }

    if (typeof mod.compressor === "function") {
        return mod.compressor as Compressor;
    }

    if (typeof mod.default === "function") {
        return mod.default as Compressor;
    }

    for (const value of Object.values(mod)) {
        if (typeof value === "function") {
            return value as Compressor;
        }
    }

    return null;
}

/**
 * Create a display label from a compressor package name or a local file path.
 *
 * @param name - Compressor npm package name or a local file path
 * @returns The package name for npm compressors, or the local file's basename without extension
 */
function generateLabel(name: string): string {
    if (isLocalPath(name)) {
        return path.basename(name).replace(/\.(js|ts|mjs|cjs)$/, "");
    }
    return name;
}

/**
 * Try to resolve a compressor from a built-in @node-minify package.
 *
 * @param name - The compressor name (e.g., "terser", "esbuild")
 * @returns The resolved CompressorResolution if found, or `null` if not installed/available
 */
export async function tryResolveBuiltIn(
    name: string
): Promise<CompressorResolution | null> {
    if (!(name in KNOWN_COMPRESSOR_EXPORTS)) {
        return null;
    }

    try {
        const mod = (await import(`@node-minify/${name}`)) as Record<
            string,
            unknown
        >;
        const compressor = extractCompressor(mod, name);

        if (compressor) {
            return {
                compressor,
                label: name,
                isBuiltIn: true,
            };
        }
    } catch {
        // Built-in package not installed
    }

    return null;
}

/**
 * Try to resolve a compressor from an npm package.
 *
 * @param name - The npm package name
 * @returns The resolved CompressorResolution if found, or `null` if not resolvable
 * @throws Error if the package is found but doesn't export a valid compressor
 */
export async function tryResolveNpmPackage(
    name: string
): Promise<CompressorResolution | null> {
    try {
        const mod = (await import(name)) as Record<string, unknown>;
        const compressor = extractCompressor(mod, name);

        if (compressor) {
            return {
                compressor,
                label: generateLabel(name),
                isBuiltIn: false,
            };
        }

        throw new Error(
            `Package '${name}' doesn't export a valid compressor function. ` +
                `Expected a function as default export, named export 'compressor', or ` +
                `named export '${toCamelCase(name)}'.`
        );
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.includes("doesn't export a valid compressor")
        ) {
            throw error;
        }
        return null;
    }
}

/**
 * Try to resolve a compressor from a local file path.
 *
 * @param name - The local file path (e.g., "./my-compressor.js")
 * @returns The resolved CompressorResolution if found, or `null` if not a local path
 * @throws Error if the file is found but doesn't export a valid compressor
 */
export async function tryResolveLocalFile(
    name: string
): Promise<CompressorResolution | null> {
    if (!isLocalPath(name)) {
        return null;
    }

    try {
        const absolutePath = path.resolve(process.cwd(), name);
        const fileUrl = pathToFileURL(absolutePath).href;
        const mod = (await import(fileUrl)) as Record<string, unknown>;
        const compressor = extractCompressor(mod, name);

        if (compressor) {
            return {
                compressor,
                label: generateLabel(name),
                isBuiltIn: false,
            };
        }

        throw new Error(
            `Local file '${name}' doesn't export a valid compressor function. ` +
                `Expected a function as default export or named export 'compressor'.`
        );
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.includes("doesn't export a valid compressor")
        ) {
            throw error;
        }
        throw new Error(
            `Could not load local compressor '${name}'. ` +
                `File not found or failed to import: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

/**
 * Resolve a compressor by name from a built-in @node-minify package, an installed npm package, or a local file path.
 *
 * @param name - Compressor identifier: a built-in name (e.g., "terser"), an npm package name, or a local path (e.g., "./compressor.js")
 * @returns The resolved CompressorResolution containing the compressor function, a display `label`, and `isBuiltIn` flag
 * @throws Error if the compressor cannot be found or the module does not export a valid compressor function
 */
export async function resolveCompressor(
    name: string
): Promise<CompressorResolution> {
    // 1. Try built-in @node-minify package
    const builtIn = await tryResolveBuiltIn(name);
    if (builtIn) {
        return builtIn;
    }

    // 2. Try as npm package
    const npmPackage = await tryResolveNpmPackage(name);
    if (npmPackage) {
        return npmPackage;
    }

    // 3. Try as local file path
    if (isLocalPath(name)) {
        const localFile = await tryResolveLocalFile(name);
        if (localFile) {
            return localFile;
        }
    }

    throw new Error(
        `Could not resolve compressor '${name}'. ` +
            `Is it installed? For local files, use a path starting with './' or '/'.`
    );
}

/**
 * Determines whether a compressor name corresponds to a known built-in compressor.
 *
 * @param name - The compressor identifier (e.g., built-in package name or alias)
 * @returns `true` if the name corresponds to a known built-in compressor, `false` otherwise.
 */
export function isBuiltInCompressor(name: string): boolean {
    return name in KNOWN_COMPRESSOR_EXPORTS;
}

/**
 * Return the known exported symbol name for a built-in compressor package.
 *
 * @param name - The compressor package name (for example, `"esbuild"`, `"terser"`)
 * @returns The export name used by the built-in package, or `undefined` if the compressor is not a known built-in
 */
export function getKnownExportName(name: string): string | undefined {
    return KNOWN_COMPRESSOR_EXPORTS[name];
}

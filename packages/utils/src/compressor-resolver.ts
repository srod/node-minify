/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
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
 * Recognizes POSIX-style relative or absolute paths starting with "./", "../", or "/",
 * and Windows absolute paths like "C:\\" or "C:/".
 *
 * @param name - The path string to test
 * @returns `true` if `name` appears to be a local file path, `false` otherwise
 */
function isLocalPath(name: string): boolean {
    return (
        name.startsWith("./") ||
        name.startsWith("../") ||
        name.startsWith("/") ||
        /^[a-zA-Z]:[\\/]/.test(name) // Windows absolute path
    );
}

/**
 * Converts a package name to camelCase for export lookup.
 *
 * Examples: "my-tool" -> "myTool", "some_pkg" -> "somePkg"
 *
 * @returns The input `name` converted to camelCase where characters following `-` or `_` are uppercased
 */
function toCamelCase(name: string): string {
    return name.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
}

/**
 * Resolve a compressor function exported by a loaded module.
 *
 * Searches the module's exports in this priority order to locate a usable compressor:
 * 1. Known built-in export for the given name
 * 2. CamelCase export derived from the package/base name
 * 3. Named export `compressor`
 * 4. Default export
 * 5. First export whose value is a function
 *
 * @param mod - The imported module object to inspect for exports
 * @param name - The package or file name used to derive known and camelCase export names
 * @returns The resolved `Compressor` function if found, or `null` if no suitable function export exists
 */
function extractCompressor(
    mod: Record<string, unknown>,
    name: string
): Compressor | null {
    // 1. Check known exports first
    const knownExport = KNOWN_COMPRESSOR_EXPORTS[name];
    if (knownExport && typeof mod[knownExport] === "function") {
        return mod[knownExport] as Compressor;
    }

    // 2. Try camelCase of package name
    const baseName = name.includes("/")
        ? (name.split("/").pop() ?? name)
        : name;
    const camelName = toCamelCase(baseName);
    if (typeof mod[camelName] === "function") {
        return mod[camelName] as Compressor;
    }

    // 3. Try "compressor" named export
    if (typeof mod.compressor === "function") {
        return mod.compressor as Compressor;
    }

    // 4. Try default export
    if (typeof mod.default === "function") {
        return mod.default as Compressor;
    }

    // 5. Find first function export
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
 * @param name - Compressor npm package name or a local file path (./, ../, /, or Windows absolute).
 * @returns The package name for npm compressors, or the local file's basename without its .js/.ts/.mjs/.cjs extension.
 */
function generateLabel(name: string): string {
    if (isLocalPath(name)) {
        // For local paths, use the filename without extension
        return path.basename(name).replace(/\.(js|ts|mjs|cjs)$/, "");
    }
    // For npm packages, use as-is
    return name;
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
    const isKnown = name in KNOWN_COMPRESSOR_EXPORTS;

    // 1. Try built-in @node-minify package
    if (isKnown) {
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
            // Built-in package not installed, will try as external
        }
    }

    // 2. Try as npm package
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
        // If it's our error about invalid exports, rethrow
        if (
            error instanceof Error &&
            error.message.includes("doesn't export a valid compressor")
        ) {
            throw error;
        }

        // 3. Try as local file path
        if (isLocalPath(name)) {
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
            } catch (localError) {
                if (
                    localError instanceof Error &&
                    localError.message.includes(
                        "doesn't export a valid compressor"
                    )
                ) {
                    throw localError;
                }
                throw new Error(
                    `Could not load local compressor '${name}'. ` +
                        `File not found or failed to import: ${localError instanceof Error ? localError.message : String(localError)}`
                );
            }
        }

        throw new Error(
            `Could not resolve compressor '${name}'. ` +
                `Is it installed? For local files, use a path starting with './' or '/'.`
        );
    }
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
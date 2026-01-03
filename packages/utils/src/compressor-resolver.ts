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
 * Checks if a string looks like a local file path.
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
 * Examples: "my-tool" -> "myTool", "some_pkg" -> "somePkg"
 */
function toCamelCase(name: string): string {
    return name.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
}

/**
 * Extracts the compressor function from a module.
 * Checks for exports in this priority order:
 * 1. Known export name (for built-in compressors)
 * 2. Named export matching camelCase of package name
 * 3. Named export "compressor"
 * 4. Default export
 * 5. First function export
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
 * Generates a user-friendly label from a compressor name/path.
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
 * Resolves a compressor from a name, which can be:
 * - A built-in @node-minify compressor name (e.g., "terser")
 * - An npm package name (e.g., "my-custom-compressor")
 * - A local file path (e.g., "./my-compressor.js")
 *
 * @param name - The compressor name, package, or file path
 * @returns Promise resolving to the compressor and metadata
 * @throws Error if the compressor cannot be found or has no valid export
 *
 * @example
 * ```ts
 * // Built-in compressor
 * const { compressor } = await resolveCompressor("terser");
 *
 * // npm package
 * const { compressor } = await resolveCompressor("my-custom-compressor");
 *
 * // Local file
 * const { compressor } = await resolveCompressor("./compressor.js");
 * ```
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
 * Check if a compressor name is a known built-in compressor.
 */
export function isBuiltInCompressor(name: string): boolean {
    return name in KNOWN_COMPRESSOR_EXPORTS;
}

/**
 * Get the export name for a known built-in compressor.
 * Returns undefined for unknown compressors.
 */
export function getKnownExportName(name: string): string | undefined {
    return KNOWN_COMPRESSOR_EXPORTS[name];
}

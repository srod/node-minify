/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import path from "node:path";

/**
 * Supported file types for auto-detection.
 */
export type FileType = "js" | "css" | "html" | "json" | "svg" | "unknown";

/**
 * Compressor selection result with package information.
 */
export interface CompressorSelection {
    compressor: string;
    type?: "js" | "css";
    package: string;
}

/**
 * Maps file extensions to file types.
 * TypeScript extensions (.ts, .tsx, .mts, .cts) are excluded as they require pre-compilation.
 */
const EXTENSION_MAP: Record<string, FileType> = {
    ".js": "js",
    ".mjs": "js",
    ".cjs": "js",
    ".jsx": "js",
    ".css": "css",
    ".html": "html",
    ".htm": "html",
    ".json": "json",
    ".svg": "svg",
};

/**
 * Maps file types to recommended compressors.
 */
const COMPRESSOR_MAP: Record<FileType, Omit<CompressorSelection, "package">> = {
    js: { compressor: "terser" },
    css: { compressor: "lightningcss" },
    html: { compressor: "html-minifier" },
    json: { compressor: "jsonminify" },
    svg: { compressor: "svgo" },
    unknown: { compressor: "no-compress" },
};

/**
 * Detects the file type based on file extension.
 *
 * @param filePath - Path to the file
 * @returns Detected file type or "unknown" if not recognized
 *
 * @example
 * detectFileType("app.js") // "js"
 * detectFileType("styles.css") // "css"
 * detectFileType("app.ts") // "unknown" (TypeScript excluded)
 */
export function detectFileType(filePath: string): FileType {
    const ext = path.extname(filePath).toLowerCase();
    return EXTENSION_MAP[ext] ?? "unknown";
}

/**
 * Selects the recommended compressor for a given file type.
 *
 * @param fileType - The file type to select a compressor for
 * @returns Compressor selection with package name
 *
 * @example
 * selectCompressor("js") // { compressor: "terser", package: "@node-minify/terser" }
 * selectCompressor("css") // { compressor: "lightningcss", package: "@node-minify/lightningcss" }
 */
export function selectCompressor(fileType: FileType): CompressorSelection {
    const { compressor, type } = COMPRESSOR_MAP[fileType];
    return {
        compressor,
        type,
        package: `@node-minify/${compressor}`,
    };
}

/**
 * Groups files by their detected file type.
 *
 * @param files - Array of file paths to group
 * @returns Object with file types as keys and arrays of matching files as values
 *
 * @example
 * groupFilesByType(["a.js", "b.css", "c.js"])
 * // { js: ["a.js", "c.js"], css: ["b.css"], html: [], json: [], svg: [], unknown: [] }
 */
export function groupFilesByType(files: string[]): Record<FileType, string[]> {
    const groups: Record<FileType, string[]> = {
        js: [],
        css: [],
        html: [],
        json: [],
        svg: [],
        unknown: [],
    };

    for (const file of files) {
        groups[detectFileType(file)].push(file);
    }

    return groups;
}

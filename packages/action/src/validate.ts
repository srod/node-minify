/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import path from "node:path";

/**
 * Validates that the output directory is not inside any source pattern.
 * Prevents infinite loop risk when output overlaps with source files.
 *
 * @param outputDir - The output directory path
 * @param patterns - Array of source file patterns (glob patterns)
 * @param workingDirectory - Base directory for resolving relative paths (defaults to ".")
 * @throws Error if outputDir is inside any source pattern
 */
export function validateOutputDir(
    outputDir: string,
    patterns: string[],
    workingDirectory = "."
): void {
    const absOutputDir = path.resolve(workingDirectory, outputDir);

    for (const pattern of patterns) {
        // Extract base directory from glob pattern (everything before first *)
        const baseDir = pattern.split("*")[0];

        // Skip root-level patterns (e.g., "*.js") - they don't recurse into subdirs
        // so outputDir in a subdir like "dist" won't cause infinite loops
        if (!baseDir || baseDir === "") {
            continue;
        }

        const absBaseDir = path.resolve(workingDirectory, baseDir);

        // Check if output dir is same as or inside base dir
        const rel = path.relative(absBaseDir, absOutputDir);

        // If rel is empty, they are same.
        // If rel does not start with '..', output is inside base.
        // Exception: check if rel is absolute (different drives on Windows)
        const isInside =
            rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));

        if (isInside) {
            throw new Error(
                `output-dir cannot be inside source pattern: '${outputDir}' overlaps with '${pattern}'`
            );
        }
    }
}

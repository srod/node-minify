/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import path from "node:path";
import * as core from "@actions/core";
import fg from "fast-glob";

export interface DiscoverOptions {
    patterns?: string[];
    ignore?: string[];
    workingDirectory?: string;
    dryRun?: boolean;
}

export const DEFAULT_PATTERNS = [
    "src/**/*.{js,mjs,cjs,jsx,css,html,htm,json,svg}",
    "app/**/*.{js,mjs,cjs,jsx,css,html,htm,json,svg}",
    "lib/**/*.{js,mjs,cjs,jsx,css,html,htm,json,svg}",
    "styles/**/*.css",
    "*.{js,mjs,cjs,css,html,htm}",
];

export const DEFAULT_IGNORES = [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.next/**",
    "**/*.min.{js,css}",
    "**/*.d.ts",
    "**/__tests__/**",
    "**/.*",
];

/**
 * Discover files matching patterns with smart defaults for common project structures.
 *
 * @param options - Discovery options including patterns, ignore rules, working directory, and dry-run mode
 * @returns Array of discovered file paths relative to the working directory
 */
export function discoverFiles(options: DiscoverOptions = {}): string[] {
    const patterns = options.patterns ?? DEFAULT_PATTERNS;
    const ignore = [...DEFAULT_IGNORES, ...(options.ignore ?? [])];
    const cwd = options.workingDirectory ?? process.cwd();

    const files = fg.globSync(patterns, {
        cwd,
        ignore,
        followSymbolicLinks: false,
        onlyFiles: true,
    });

    if (options.dryRun) {
        core.info(`[dry-run] Would process ${files.length} files`);
        for (const file of files) {
            core.info(`  - ${file}`);
        }
    }

    if (files.length === 0) {
        core.warning("No files found matching patterns");
    }

    return files;
}

/**
 * Generate output path by joining output directory with input file path.
 *
 * @param inputFile - Input file path (relative or absolute)
 * @param outputDir - Output directory path
 * @returns Combined output path preserving input file's directory structure
 */
export function generateOutputPath(
    inputFile: string,
    outputDir: string
): string {
    // Normalize first to resolve internal '..' segments
    // e.g. "foo/../../bar.js" -> "../bar.js"
    let cleanInput = path.normalize(inputFile);

    if (path.isAbsolute(cleanInput)) {
        const parsed = path.parse(cleanInput);
        cleanInput = cleanInput.slice(parsed.root.length);
    }

    // Remove leading directory traversal sequences
    cleanInput = cleanInput.replace(/^(\.\.[/\\])+/, "");

    return path.join(outputDir, cleanInput);
}

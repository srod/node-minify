/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import os from "node:os";
import path from "node:path";
import fg from "fast-glob";

/**
 * Options for wildcards function
 */
export interface WildcardOptions {
    /**
     * Path to the public folder
     */
    publicFolder?: string;
    /**
     * Patterns to ignore when matching files
     */
    ignore?: string[];
}

/**
 * Default ignore patterns for common build artifacts and dependencies
 */
export const DEFAULT_IGNORES: string[] = [
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
 * Check if the platform is Windows
 */
function isWindows() {
    return os.platform() === "win32";
}

/**
 * Normalize any Windows path separators to POSIX separators.
 * @param value Path-like string
 * @returns Path string using `/` separators
 */
function toPosixPath(value: string): string {
    return value.replaceAll("\\", "/");
}

/**
 * Handle wildcards in a path, get the real path of each file.
 * @param input - Path with wildcards
 * @param options - Options object or string publicFolder for backward compatibility
 * @returns Object with resolved file paths
 */
export function wildcards(
    input: string | string[],
    options?: WildcardOptions | string
) {
    const normalizedOptions: WildcardOptions =
        typeof options === "string"
            ? { publicFolder: options }
            : (options ?? {});

    if (Array.isArray(input)) {
        return wildcardsArray(input, normalizedOptions);
    }

    return wildcardsString(input, normalizedOptions);
}

/**
 * Handle wildcards in a path (string only), get the real path of each file.
 * @param input - Path with wildcards
 * @param options - Wildcard options
 */
function wildcardsString(input: string, options: WildcardOptions) {
    if (!input.includes("*")) {
        return {};
    }

    const files = getFilesFromWildcards(input, options);
    const finalPaths = files.filter((path: string) => !path.includes("*"));

    return {
        input: finalPaths,
    };
}

/**
 * Handle wildcards in a path (array only), get the real path of each file.
 * @param input - Array of paths with wildcards
 * @param options - Wildcard options
 */
function wildcardsArray(input: string[], options: WildcardOptions) {
    const inputWithPublicFolder = input.map((item) => {
        const input2 = options.publicFolder
            ? path.posix.join(
                  toPosixPath(options.publicFolder),
                  toPosixPath(item)
              )
            : item;
        return isWindows() ? fg.convertPathToPattern(input2) : input2;
    });

    const hasWildcards = inputWithPublicFolder.some((item) =>
        item.includes("*")
    );

    const processedPaths = hasWildcards
        ? fg.globSync(inputWithPublicFolder, { ignore: options.ignore })
        : inputWithPublicFolder;

    const finalPaths = processedPaths.filter(
        (path: string) => !path.includes("*")
    );

    return { input: finalPaths };
}

/**
 * Get the real path of each file.
 * @param input - Path with wildcards
 * @param options - Wildcard options
 */
function getFilesFromWildcards(input: string, options: WildcardOptions) {
    const fullPath = options.publicFolder
        ? path.posix.join(toPosixPath(options.publicFolder), toPosixPath(input))
        : input;
    return fg.globSync(
        isWindows() ? fg.convertPathToPattern(fullPath) : fullPath,
        { ignore: options.ignore }
    );
}

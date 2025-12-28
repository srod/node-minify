/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import os from "node:os";
import fg from "fast-glob";

/**
 * Check if the platform is Windows
 */
function isWindows() {
    return os.platform() === "win32";
}

/**
 * Handle wildcards in a path, get the real path of each file.
 * @param input - Path with wildcards
 * @param publicFolder - Path to the public folder
 */
export function wildcards(input: string | string[], publicFolder?: string) {
    if (Array.isArray(input)) {
        return wildcardsArray(input, publicFolder);
    }

    return wildcardsString(input, publicFolder);
}

/**
 * Handle wildcards in a path (string only), get the real path of each file.
 * @param input - Path with wildcards
 * @param publicFolder - Path to the public folder
 */
function wildcardsString(input: string, publicFolder?: string) {
    if (!input.includes("*")) {
        return {};
    }

    const files = getFilesFromWildcards(input, publicFolder);
    const finalPaths = files.filter((path: string) => !path.includes("*"));

    return {
        input: finalPaths,
    };
}

/**
 * Handle wildcards in a path (array only), get the real path of each file.
 * @param input - Array of paths with wildcards
 * @param publicFolder - Path to the public folder
 */
function wildcardsArray(input: string[], publicFolder?: string) {
    // Convert input paths to patterns with public folder prefix
    const inputWithPublicFolder = input.map((item) => {
        const input2 = publicFolder ? publicFolder + item : item;
        return isWindows() ? fg.convertPathToPattern(input2) : input2;
    });

    // Check if any wildcards exist
    const hasWildcards = inputWithPublicFolder.some((item) =>
        item.includes("*")
    );

    // Process paths based on whether wildcards exist
    const processedPaths = hasWildcards
        ? fg.globSync(inputWithPublicFolder)
        : input;

    // Filter out any remaining paths with wildcards
    const finalPaths = processedPaths.filter(
        (path: string) => !path.includes("*")
    );

    return { input: finalPaths };
}

/**
 * Get the real path of each file.
 * @param input - Path with wildcards
 * @param publicFolder - Path to the public folder
 */
function getFilesFromWildcards(input: string, publicFolder?: string) {
    const fullPath = publicFolder ? `${publicFolder}${input}` : input;
    return fg.globSync(
        isWindows() ? fg.convertPathToPattern(fullPath) : fullPath
    );
}

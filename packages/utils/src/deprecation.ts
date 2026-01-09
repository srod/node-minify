/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

const warnedPackages = new Set<string>();

/**
 * Show a deprecation warning for a package, but only once per process.
 * Subsequent calls with the same package name will be ignored.
 *
 * @param packageName - The package name (e.g., "babel-minify", "uglify-es")
 * @param message - The deprecation message explaining why and what to use instead
 *
 * @example
 * ```ts
 * warnDeprecation(
 *   "babel-minify",
 *   "babel-minify uses Babel 6 which is no longer maintained. " +
 *   "Please migrate to @node-minify/terser for continued support."
 * );
 * ```
 */
export function warnDeprecation(packageName: string, message: string): void {
    if (warnedPackages.has(packageName)) {
        return;
    }

    warnedPackages.add(packageName);
    console.warn(`[@node-minify/${packageName}] DEPRECATED: ${message}`);
}

/**
 * Reset the deprecation warning state.
 * Only intended for testing purposes.
 */
export function resetDeprecationWarnings(): void {
    warnedPackages.clear();
}

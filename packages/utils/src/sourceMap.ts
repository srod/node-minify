/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Normalize sourceMap option to boolean for compressors that only accept boolean.
 *
 * @param options - Compressor options object that may contain a `sourceMap` property
 * @returns `true` if `sourceMap` is truthy, `false` otherwise
 */
export function getSourceMapBoolean(
    options?: Record<string, unknown>
): boolean {
    return !!options?.sourceMap;
}

/**
 * Extract sourceMap from options, returning the boolean flag and remaining options separately.
 * Useful for compressors where sourceMap must be handled as a distinct parameter.
 *
 * @param options - Compressor options object that may contain a `sourceMap` property
 * @returns Object with `sourceMap` boolean and `restOptions` without the sourceMap key
 */
export function extractSourceMapOption(options?: Record<string, unknown>): {
    sourceMap: boolean;
    restOptions: Record<string, unknown>;
} {
    if (!options) {
        return { sourceMap: false, restOptions: {} };
    }
    const { sourceMap, ...restOptions } = options;
    return {
        sourceMap: !!sourceMap,
        restOptions,
    };
}

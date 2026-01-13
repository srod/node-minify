/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Wraps an error thrown during minification with a consistent, descriptive message.
 *
 * @param compressorName - The name of the compressor that failed
 * @param error - The original error (unknown type for proper catch handling)
 * @returns A new Error with a standardized message format
 */
export function wrapMinificationError(
    compressorName: string,
    error: unknown
): Error {
    const message = error instanceof Error ? error.message : String(error);
    return new Error(`${compressorName} minification failed: ${message}`);
}

/**
 * Validates that a minification result contains valid output.
 *
 * @param result - The result object to validate
 * @param compressorName - The name of the compressor (for error messages)
 * @throws Error if result is falsy or result.code is not a string
 */
export function validateMinifyResult(
    result: unknown,
    compressorName: string
): asserts result is { code: string } {
    if (
        !result ||
        typeof result !== "object" ||
        !("code" in result) ||
        typeof (result as { code: unknown }).code !== "string"
    ) {
        throw new Error(`${compressorName} failed: empty or invalid result`);
    }
}

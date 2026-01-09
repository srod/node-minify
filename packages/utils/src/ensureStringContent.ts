/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Convert provided content to a string suitable for text-based compressors.
 *
 * @param content - The input content; a `Buffer` is converted to a string, `undefined` becomes an empty string, and a `Buffer[]` is rejected.
 * @param compressorName - Name used in the error message when array content is not supported.
 * @returns The content as a string; returns an empty string when `content` is `undefined`.
 * @throws Error if `content` is an array with message "`<compressorName> compressor does not support array content`".
 */
export function ensureStringContent(
    content: string | Buffer | Buffer[] | undefined,
    compressorName: string
): string {
    if (Array.isArray(content)) {
        throw new Error(
            `${compressorName} compressor does not support array content`
        );
    }

    if (Buffer.isBuffer(content)) {
        return content.toString();
    }

    return content ?? "";
}

/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Ensure provided content is returned as a string.
 *
 * @param content - Input which may be a string, Buffer, Buffer[], or undefined
 * @param compressorName - Name included in the error message when array content is unsupported
 * @returns The content as a string; returns an empty string if `content` is `undefined`
 * @throws Error if `content` is an array with message "`<compressorName> compressor does not support array content`"
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
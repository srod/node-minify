/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Ensure content is a string, converting from Buffer if needed.
 * Throws if content is an array (not supported by text-based compressors).
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

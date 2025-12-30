/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";

/**
 * Passes input content through unchanged and returns it as the compressor result.
 *
 * @param content - The input to pass through; may be a `string`, a `Buffer`, or `undefined`.
 * @returns An object with `code` set to the input converted to a string (empty string if `content` is `undefined`).
 * @throws Error if `content` is neither a `string` nor a `Buffer`.
 */
export async function noCompress({
    content,
}: MinifierOptions): Promise<CompressorResult> {
    if (content instanceof Buffer) {
        return { code: content.toString() };
    }

    if (typeof content === "string") {
        return { code: content };
    }

    if (content === undefined) {
        return { code: "" };
    }

    throw new Error(
        `no-compress failed: content must be a string or Buffer but received ${typeof content}`
    );
}
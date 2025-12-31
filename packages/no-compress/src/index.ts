/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";

/**
 * Passes input content through unchanged.
 *
 * Supports `Buffer`, `string`, or `undefined`. If `content` is a `Buffer` it is converted to a string; if `content` is `undefined` the returned `code` is an empty string.
 *
 * @param content - Input content to pass through; may be a `Buffer`, `string`, or `undefined`
 * @returns An object whose `code` property contains the input as a string (empty string when `content` is `undefined`)
 * @throws Error if `content` is not a `Buffer`, `string`, or `undefined`
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

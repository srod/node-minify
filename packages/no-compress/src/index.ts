/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";

/**
 * No compression, just concatenation.
 * @param content - Content to pass through
 * @returns Unmodified content
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

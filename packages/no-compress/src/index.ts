/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
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
    if (typeof content !== "string") {
        throw new Error("no-compress failed: empty result");
    }

    return { code: content };
}

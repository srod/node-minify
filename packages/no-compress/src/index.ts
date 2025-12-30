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
    const contentStr =
        content instanceof Buffer
            ? content.toString()
            : ((content ?? "") as string);

    if (typeof contentStr !== "string") {
        throw new Error("no-compress failed: empty result");
    }

    return { code: contentStr };
}

/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { minify as oxcMinify } from "oxc-minify";

export async function oxc({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    if (Array.isArray(content)) {
        throw new Error("oxc compressor does not support array content");
    }

    const options = settings?.options ?? {};

    const contentStr =
        content instanceof Buffer
            ? content.toString()
            : ((content ?? "") as string);

    const result = await oxcMinify("input.js", contentStr, {
        sourcemap: !!options.sourceMap,
        ...options,
    });

    return {
        code: result.code,
        map: undefined,
    };
}

/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";
import { minify as oxcMinify } from "oxc-minify";

export async function oxc({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "oxc");

    const options = settings?.options ?? {};

    const result = await oxcMinify("input.js", contentStr, {
        sourcemap: !!options.sourceMap,
        ...options,
    });

    return {
        code: result.code,
        map: undefined,
    };
}

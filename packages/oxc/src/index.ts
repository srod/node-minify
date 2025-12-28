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
    const options = settings?.options ?? {};

    const result = await oxcMinify("input.js", content ?? "", {
        sourcemap: !!options.sourceMap,
        ...options,
    });

    return {
        code: result.code,
        map: undefined,
    };
}

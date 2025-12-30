/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";
import { minify as swcMinify } from "@swc/core";

export async function swc({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "swc");

    const options = settings?.options ?? {};

    const result = await swcMinify(contentStr, {
        compress: true,
        mangle: true,
        sourceMap: !!options.sourceMap,
        ...options,
    });

    return {
        code: result.code,
        map: result.map || undefined,
    };
}

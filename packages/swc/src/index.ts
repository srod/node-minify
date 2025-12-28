/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { minify as swcMinify } from "@swc/core";

export async function swc({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const options = settings?.options ?? {};

    const result = await swcMinify(content ?? "", {
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

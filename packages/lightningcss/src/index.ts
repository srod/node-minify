/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";
import { transform } from "lightningcss";

export async function lightningCss({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "lightningcss");

    const options = settings?.options ?? {};

    const result = transform({
        filename: "input.css",
        code: Buffer.from(contentStr),
        minify: true,
        sourceMap: !!options.sourceMap,
        ...options,
    });

    return {
        code: result.code.toString(),
        map: result.map ? result.map.toString() : undefined,
    };
}

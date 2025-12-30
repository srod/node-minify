/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { transform } from "lightningcss";

export async function lightningCss({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const options = settings?.options ?? {};

    if (Array.isArray(content)) {
        throw new Error(
            "LightningCSS compressor does not support array content"
        );
    }

    const result = transform({
        filename: "input.css",
        code: Buffer.from(content ?? ""),
        minify: true,
        sourceMap: !!options.sourceMap,
        ...options,
    });

    return {
        code: result.code.toString(),
        map: result.map ? result.map.toString() : undefined,
    };
}

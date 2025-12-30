/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";
import { transform } from "lightningcss";

/**
 * Minifies CSS content using lightningcss and returns the minified code plus an optional source map.
 *
 * @param settings - Optional minifier settings; `settings.options`, if provided, are forwarded to `lightningcss.transform`.
 * @param content - CSS input to be minified; will be coerced to a string prior to processing.
 * @returns An object with `code` containing the minified CSS as a string and `map` containing the source map as a string if produced, or `undefined` otherwise.
 */
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
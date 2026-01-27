/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent, getSourceMapBoolean } from "@node-minify/utils";
import { transform } from "lightningcss";

/**
 * Minifies CSS using the lightningcss transform and returns the minified output.
 *
 * @param settings - Minifier settings; `settings.options`, if present, are forwarded to lightningcss transform as transform options.
 * @param content - Input CSS content to be minified; non-string inputs will be converted to a string.
 * @returns An object with `code` containing the minified CSS and `map` containing the source map as a string when available, otherwise `undefined`.
 */
export async function lightningCss({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "lightningcss");

    const options = settings?.options ?? {};
    const enableSourceMap = getSourceMapBoolean(options);

    const result = transform({
        filename: "input.css",
        code: Buffer.from(contentStr),
        minify: true,
        sourceMap: enableSourceMap,
        ...options,
    });

    return {
        code: result.code.toString(),
        map: result.map ? result.map.toString() : undefined,
    };
}

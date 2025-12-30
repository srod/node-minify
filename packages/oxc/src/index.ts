/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";
import { minify as oxcMinify } from "oxc-minify";

/**
 * Minifies JavaScript source using the oxc-minify library and the provided options.
 *
 * @param settings - Optional minifier settings; `settings.options` are forwarded to oxc-minify.
 * @param content - Input to minify; will be converted to a string before processing.
 * @returns An object with `code` containing the minified source and `map` set to `undefined`.
 */
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
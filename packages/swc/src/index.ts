/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";
import { minify as swcMinify } from "@swc/core";

/**
 * Minifies JavaScript/TypeScript source using SWC with compression and mangling enabled.
 *
 * @param settings - Optional minifier settings; `settings.options` (if present) are forwarded to SWC and merged with the defaults `{ compress: true, mangle: true, sourceMap: !!options.sourceMap }`.
 * @param content - Input source to be minified; will be converted to a string.
 * @returns An object with `code` containing the minified source and `map` containing the source map if produced, otherwise `undefined`.
 */
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
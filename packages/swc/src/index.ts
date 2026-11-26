/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import {
    ensureStringContent,
    extractSourceMapOption,
    wrapMinificationError,
} from "@node-minify/utils";
import { minify as swcMinify } from "@swc/core";

/**
 * Minifies JavaScript/TypeScript source using SWC with compression and mangling enabled.
 *
 * @param settings - Optional minifier settings; `settings.options` are merged into SWC options and may include `sourceMap`.
 * @param content - The input source to minify. Non-string inputs will be coerced to a string.
 * @returns An object with `code` containing the minified source and `map` containing the source map if produced, otherwise `undefined`.
 * @throws Error `swc minification failed: <message>` with the original error as `cause` if SWC fails.
 */
export async function swc({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "swc");

    const { sourceMap, restOptions } = extractSourceMapOption(
        settings?.options
    );

    try {
        const result = await swcMinify(contentStr, {
            compress: true,
            mangle: true,
            sourceMap,
            ...restOptions,
        });

        return {
            code: result.code,
            map: result.map || undefined,
        };
    } catch (error) {
        throw wrapMinificationError("swc", error);
    }
}

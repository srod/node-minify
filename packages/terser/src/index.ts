/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent, wrapMinificationError } from "@node-minify/utils";
import { minify } from "terser";

/**
 * Minifies JavaScript content using Terser.
 *
 * @param settings - Optional minifier settings; `settings.options` are forwarded to Terser
 * @param content - Input to minify; non-string inputs will be converted to a string
 * @returns An object with `code` containing the minified source and `map` containing the source map string when available
 * @throws Error `terser minification failed: <message>` with the original error as `cause` if Terser fails or produces no output code
 */
export async function terser({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "terser");

    try {
        const result = await minify(contentStr, settings?.options);

        if (typeof result.code !== "string") {
            throw new Error("empty result");
        }

        return {
            code: result.code,
            map: typeof result.map === "string" ? result.map : undefined,
        };
    } catch (error) {
        throw wrapMinificationError("terser", error);
    }
}

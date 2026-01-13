/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent, wrapMinificationError } from "@node-minify/utils";
import CleanCSS from "clean-css";

/**
 * Minify CSS using the clean-css library and produce an optional source map.
 *
 * @param settings - Configuration for the clean-css minifier (may include an `options` object with clean-css flags)
 * @param content - CSS input to be minified
 * @returns An object with `code` containing the minified CSS and `map` containing the source map as a string if available
 */
export async function cleanCss({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "clean-css");
    const options = settings?.options ? { ...settings.options } : {};

    if (options.sourceMap && typeof options.sourceMap === "object") {
        options._sourceMap = options.sourceMap;
        options.sourceMap = true;
    }

    try {
        const result = new CleanCSS({
            returnPromise: false,
            ...options,
        }).minify(contentStr);

        if (result.errors && result.errors.length > 0) {
            throw new Error(result.errors.join("; "));
        }

        if (typeof result.styles !== "string") {
            throw new Error("clean-css failed: empty result");
        }

        return {
            code: result.styles,
            map: result.sourceMap?.toString(),
        };
    } catch (error) {
        throw wrapMinificationError("clean-css", error);
    }
}

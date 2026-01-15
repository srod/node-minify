/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent, wrapMinificationError } from "@node-minify/utils";

const defaultOptions = {
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
};

/**
 * Minifies HTML content using html-minifier-next, applying default options merged with any provided settings.
 *
 * @param settings - Optional minifier settings; `settings.options` are merged with the built-in defaults to form the effective minification options.
 * @param content - The input to minify; will be converted to a string before minification.
 * @returns An object containing the minified HTML as `code`.
 */
export async function htmlMinifier({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "html-minifier");

    try {
        const { minify } = await import("html-minifier-next");
        const options = { ...defaultOptions, ...settings?.options };
        const code = await minify(contentStr, options);

        if (typeof code !== "string") {
            throw new Error("html-minifier failed: empty result");
        }

        return { code };
    } catch (error) {
        throw wrapMinificationError("html-minifier", error);
    }
}

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";

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
 * Minifies HTML content using html-minifier-next, applying default options with any provided overrides.
 *
 * @param settings - Optional minifier configuration; `settings.options` are merged with the built-in defaults.
 * @param content - HTML input to minify; will be converted to a string before processing.
 * @returns An object with `code` containing the minified HTML string.
 */
export async function htmlMinifier({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "html-minifier");

    const { minify } = await import("html-minifier-next");
    const options = { ...defaultOptions, ...settings?.options };

    const code = await minify(contentStr, options);

    return { code };
}
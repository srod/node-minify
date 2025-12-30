/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent, warnDeprecation } from "@node-minify/utils";
import uglifyES from "uglify-es";

/**
 * Minifies JavaScript content using the uglify-es compressor.
 *
 * @deprecated uglify-es is no longer maintained; migrate to @node-minify/terser.
 * @param settings - Minifier configuration and uglify-es options
 * @param content - Input content to minify; may be a string or a buffer
 * @returns An object with `code` containing the minified source and `map` containing the source map if available
 */
export async function uglifyEs({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "uglify-es");

    warnDeprecation(
        "uglify-es",
        "uglify-es is no longer maintained. " +
            "Please migrate to @node-minify/terser for continued support and modern JavaScript features."
    );

    let inputContent: string | Record<string, string> = contentStr;
    const sourceMapOptions = settings.options?.sourceMap as
        | { filename?: string }
        | undefined;

    if (typeof sourceMapOptions === "object") {
        inputContent = {
            [sourceMapOptions.filename ?? ""]: contentStr,
        };
    }

    const result = uglifyES.minify(inputContent, settings.options);

    if (result.error) {
        throw result.error;
    }

    return {
        code: result.code,
        map: result.map,
    };
}
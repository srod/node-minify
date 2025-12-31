/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent, warnDeprecation } from "@node-minify/utils";
import uglifyES from "uglify-es";

/**
 * Minifies JavaScript content using uglify-es.
 *
 * @deprecated uglify-es is no longer maintained. Use @node-minify/terser instead.
 * @param settings - Minifier settings and uglify-es options
 * @param content - Input content to minify
 * @returns The minified code as `code` and the source map as `map` if produced
 * @throws The error produced by uglify-es when minification fails
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

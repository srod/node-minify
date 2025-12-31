/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";
import uglifyJS from "uglify-js";

/**
 * Minify JavaScript content using uglify-js.
 *
 * @param settings - UglifyJS options container used for minification
 * @param content - Content to be minified; will be converted to a string if necessary
 * @returns An object with `code` containing the minified code and optional `map` containing the source map
 */
export async function uglifyJs({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "uglify-js");

    const result = uglifyJS.minify(contentStr, settings?.options);

    if (result.error) {
        throw result.error;
    }

    return {
        code: result.code,
        map: result.map,
    };
}

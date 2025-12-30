/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";
import uglifyJS from "uglify-js";

/**
 * Minify JavaScript using uglify-js.
 *
 * @param settings - Optional UglifyJS options applied to the minification process
 * @param content - Input to minify; will be converted to a string before processing
 * @returns An object with `code` containing the minified source and `map` containing the source map if generated
 * @throws The error produced by uglify-js when minification fails
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
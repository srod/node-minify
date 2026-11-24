/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent, wrapMinificationError } from "@node-minify/utils";
import uglifyJS from "uglify-js";

/**
 * Minify JavaScript content using uglify-js.
 *
 * @param settings - UglifyJS options container used for minification
 * @param content - Content to be minified; will be converted to a string if necessary
 * @returns An object with `code` containing the minified code and optional `map` containing the source map
 * @throws Error `uglify-js minification failed: <message>` with the original error as `cause` if UglifyJS fails
 */
export async function uglifyJs({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "uglify-js");

    try {
        const result = uglifyJS.minify(contentStr, settings?.options);

        if (result.error) {
            throw result.error;
        }

        return {
            code: result.code,
            map: result.map,
        };
    } catch (error) {
        throw wrapMinificationError("uglify-js", error);
    }
}

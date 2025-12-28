/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import uglifyJS from "uglify-js";

/**
 * Run uglify-js.
 * @param settings - UglifyJS options
 * @param content - Content to minify
 * @returns Minified content and optional source map
 */
export async function uglifyJs({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const result = uglifyJS.minify(content ?? "", settings?.options);

    if (result.error) {
        throw result.error;
    }

    return {
        code: result.code,
        map: result.map,
    };
}

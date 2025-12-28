/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import CleanCSS from "clean-css";

/**
 * Run clean-css.
 * @param settings - Clean-css options
 * @param content - Content to minify
 * @returns Minified content and optional source map
 */
export async function cleanCss({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const options = settings?.options ? { ...settings.options } : {};

    if (options.sourceMap && typeof options.sourceMap === "object") {
        options._sourceMap = options.sourceMap;
        options.sourceMap = true;
    }

    const result = new CleanCSS({ returnPromise: false, ...options }).minify(
        content ?? ""
    );

    return {
        code: result.styles,
        map: result.sourceMap?.toString(),
    };
}

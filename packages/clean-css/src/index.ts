/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";
import CleanCSS from "clean-css";

/**
 * Minifies CSS using clean-css and returns the resulting code and optional source map.
 *
 * If `settings.options.sourceMap` is an object, it will be forwarded to CleanCSS as `_sourceMap`
 * and `sourceMap` will be enabled so the returned `map` contains the generated source map.
 *
 * @param settings - Minifier settings; `settings.options` are forwarded to clean-css
 * @param content - CSS content to minify
 * @returns The minified CSS as `code` and the source map as `map` when available
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

    const result = new CleanCSS({ returnPromise: false, ...options }).minify(
        contentStr
    );

    return {
        code: result.styles,
        map: result.sourceMap?.toString(),
    };
}
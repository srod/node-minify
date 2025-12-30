/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { warnDeprecation } from "@node-minify/utils";
import uglifyES from "uglify-es";

/**
 * Run uglify-es.
 * @deprecated uglify-es is no longer maintained. Use @node-minify/terser instead.
 * @param settings - UglifyES options
 * @param content - Content to minify
 * @returns Minified content and optional source map
 */
export async function uglifyEs({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    if (Array.isArray(content)) {
        throw new Error("uglify-es compressor does not support array content");
    }

    warnDeprecation(
        "uglify-es",
        "uglify-es is no longer maintained. " +
            "Please migrate to @node-minify/terser for continued support and modern JavaScript features."
    );

    const contentStr =
        content instanceof Buffer
            ? content.toString()
            : ((content ?? "") as string);

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

/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import uglifyES from "uglify-es";

let deprecationWarned = false;

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
    if (!deprecationWarned) {
        console.warn(
            "[@node-minify/uglify-es] DEPRECATED: uglify-es is no longer maintained. " +
                "Please migrate to @node-minify/terser for continued support and modern JavaScript features."
        );
        deprecationWarned = true;
    }

    let inputContent: string | Record<string, string> = content ?? "";
    const sourceMapOptions = settings.options?.sourceMap as
        | { filename?: string }
        | undefined;

    if (typeof sourceMapOptions === "object") {
        inputContent = {
            [sourceMapOptions.filename ?? ""]: content ?? "",
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

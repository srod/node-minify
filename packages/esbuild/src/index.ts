/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";
import { transform } from "esbuild";

/**
 * Minifies JavaScript or CSS content using esbuild according to the provided settings.
 *
 * @param settings - Minification settings; `settings.type` must be `"js"` or `"css"`. Optional `settings.options` are passed to esbuild.transform (except `sourceMap` which is handled separately).
 * @param content - Input content to be minified; will be converted to a string if necessary.
 * @returns An object with `code` containing the minified output and `map` containing the source map if produced, otherwise `undefined`.
 * @throws Error if `settings.type` is missing or not `"js"` or `"css"`.
 */
export async function esbuild({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "esbuild");

    if (
        !settings?.type ||
        (settings.type !== "js" && settings.type !== "css")
    ) {
        throw new Error("You must specify a type: js or css");
    }

    const loader = settings.type === "css" ? "css" : "js";
    const { sourceMap, ...restOptions } = settings?.options ?? {};

    const result = await transform(contentStr, {
        loader,
        minify: true,
        sourcemap: !!sourceMap,
        ...restOptions,
    });

    return {
        code: result.code,
        map: result.map || undefined,
    };
}

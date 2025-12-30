/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";
import { transform } from "esbuild";

/**
 * Minifies JavaScript or CSS content using esbuild.
 *
 * @param settings - Minifier settings; must include `type` set to `"js"` or `"css"`. Any `options` provided are forwarded to esbuild (e.g., `sourceMap`).
 * @param content - The input to minify; will be converted to a string before processing.
 * @returns An object with `code` containing the minified output and `map` containing the source map string if produced, otherwise `undefined`.
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
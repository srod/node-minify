/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";
import { transform } from "esbuild";

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

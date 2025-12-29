/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { minify } from "terser";

/**
 * Run terser.
 * @param settings - Terser options
 * @param content - Content to minify
 * @returns Minified content and optional source map
 */
export async function terser({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const result = await minify((content ?? "") as string, settings?.options);

    if (typeof result.code !== "string") {
        throw new Error("Terser failed: empty result");
    }

    return {
        code: result.code,
        map: typeof result.map === "string" ? result.map : undefined,
    };
}

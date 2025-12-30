/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";
import { minify } from "terser";

/**
 * Minifies JavaScript content using terser and the provided options.
 *
 * @param settings - Terser options passed to terser under `settings.options`
 * @param content - The source content to minify
 * @returns An object with `code` containing the minified output and `map` containing the source map string if available
 * @throws Error if terser produces no code (empty result)
 */
export async function terser({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "terser");

    const result = await minify(contentStr, settings?.options);

    if (typeof result.code !== "string") {
        throw new Error("Terser failed: empty result");
    }

    return {
        code: result.code,
        map: typeof result.map === "string" ? result.map : undefined,
    };
}
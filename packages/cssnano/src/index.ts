/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";
import minify from "cssnano";
import postcss from "postcss";

/**
 * Minify CSS using cssnano (via PostCSS).
 *
 * @param content - The CSS input to minify (string or Buffer)
 * @returns An object with `code` containing the minified CSS string
 */
export async function cssnano({
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "cssnano");

    const result = await postcss([minify]).process(contentStr, {
        from: undefined,
    });

    return { code: result.css };
}
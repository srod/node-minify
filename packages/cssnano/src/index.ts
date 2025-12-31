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
 * Minifies the provided CSS content using cssnano via PostCSS.
 *
 * @param content - The CSS content to minify (string or buffer)
 * @returns An object whose `code` property is the minified CSS string
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
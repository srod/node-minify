/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import jsonminify from "jsonminify";

/**
 * Run jsonminify.
 * @param content - Content to minify
 * @returns Minified content
 */
export async function jsonMinify({
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr =
        content instanceof Buffer
            ? content.toString()
            : ((content ?? "") as string);
    const code = jsonminify(contentStr);

    return { code };
}

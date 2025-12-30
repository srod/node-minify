/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { minify } from "csso";

/**
 * Run csso.
 * @param settings - CSSO options
 * @param content - Content to minify
 * @returns Minified content
 */
export async function csso({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    if (Array.isArray(content)) {
        throw new Error("csso compressor does not support array content");
    }

    const contentStr =
        content instanceof Buffer
            ? content.toString()
            : ((content ?? "") as string);
    const result = await minify(contentStr, settings?.options);

    return { code: result.css };
}

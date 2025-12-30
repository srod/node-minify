/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";
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
    const contentStr = ensureStringContent(content, "csso");

    const result = await minify(contentStr, settings?.options);

    return { code: result.css };
}

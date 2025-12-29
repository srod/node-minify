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
    const result = await minify((content ?? "") as string, settings?.options);

    return { code: result.css };
}

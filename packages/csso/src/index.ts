/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";
import { minify } from "csso";

/**
 * Minifies CSS using CSSO.
 *
 * @param settings - Compressor options; any `options` provided are forwarded to CSSO
 * @param content - CSS content to minify (e.g., string or Buffer)
 * @returns An object with the minified CSS in the `code` property
 */
export async function csso({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "csso");

    const result = await minify(contentStr, settings?.options);

    return { code: result.css };
}
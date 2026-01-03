/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";
import { minify } from "csso";

/**
 * Minifies CSS using CSSO.
 *
 * @param settings - CSSO minifier options (passed to CSSO's `minify` call)
 * @param content - CSS content to minify; non-string values will be coerced to a string
 * @returns An object with the minified CSS available as the `code` property
 */
export async function csso({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "csso");

    const result = await minify(contentStr, settings?.options);

    return { code: result.css };
}

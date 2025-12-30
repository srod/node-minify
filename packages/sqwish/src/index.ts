/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent, warnDeprecation } from "@node-minify/utils";
import minify from "sqwish";

/**
 * Run sqwish.
 * @deprecated sqwish is no longer maintained. Use @node-minify/cssnano or @node-minify/clean-css instead.
 * @param settings - Sqwish options
 * @param content - Content to minify
 * @returns Minified content
 */
export async function sqwish({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "sqwish");

    warnDeprecation(
        "sqwish",
        "sqwish is no longer maintained. " +
            "Please migrate to @node-minify/cssnano or @node-minify/clean-css."
    );

    const strict = settings?.options?.strict as boolean | undefined;

    const code = minify.minify(contentStr, strict);

    return { code };
}

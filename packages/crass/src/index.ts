/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent, warnDeprecation } from "@node-minify/utils";
import minify from "crass";

/**
 * Run crass.
 * @deprecated crass is no longer maintained. Use @node-minify/cssnano or @node-minify/clean-css instead.
 * @param content - Content to minify
 * @returns Minified content
 */
export async function crass({
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "crass");

    warnDeprecation(
        "crass",
        "crass is no longer maintained. " +
            "Please migrate to @node-minify/cssnano or @node-minify/clean-css."
    );

    const code = minify.parse(contentStr).optimize().toString();

    return { code };
}

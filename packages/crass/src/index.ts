/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import minify from "crass";

let deprecationWarned = false;

/**
 * Run crass.
 * @deprecated crass is no longer maintained. Use @node-minify/cssnano or @node-minify/clean-css instead.
 * @param content - Content to minify
 * @returns Minified content
 */
export async function crass({
    content,
}: MinifierOptions): Promise<CompressorResult> {
    if (!deprecationWarned) {
        console.warn(
            "[@node-minify/crass] DEPRECATED: crass is no longer maintained. " +
                "Please migrate to @node-minify/cssnano or @node-minify/clean-css."
        );
        deprecationWarned = true;
    }

    const code = minify.parse(content).optimize().toString();

    return { code };
}

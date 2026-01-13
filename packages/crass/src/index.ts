/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import {
    ensureStringContent,
    warnDeprecation,
    wrapMinificationError,
} from "@node-minify/utils";
import minify from "crass";

/**
 * Minifies CSS content using the crass library.
 *
 * @deprecated crass is no longer maintained. Use @node-minify/cssnano or @node-minify/clean-css instead.
 * @param content - Input CSS content to minify
 * @returns An object whose `code` property contains the minified CSS
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

    try {
        const code = minify.parse(contentStr).optimize().toString();

        if (typeof code !== "string") {
            throw new Error("crass failed: empty result");
        }

        return { code };
    } catch (error) {
        throw wrapMinificationError("crass", error);
    }
}

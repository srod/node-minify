/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent, wrapMinificationError } from "@node-minify/utils";
import minify from "cssnano";
import postcss from "postcss";

/**
 * Minifies the provided CSS content using cssnano via PostCSS.
 *
 * @param settings - Minifier settings; `settings.options` are forwarded to cssnano as preset options.
 * @param content - The CSS content to minify (string or buffer)
 * @returns An object whose `code` property is the minified CSS string
 */
export async function cssnano({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "cssnano");
    const options = settings?.options ?? {};

    try {
        const result = await postcss([minify(options)]).process(contentStr, {
            from: undefined,
        });

        if (typeof result.css !== "string") {
            throw new Error("cssnano failed: empty result");
        }

        return { code: result.css };
    } catch (error) {
        throw wrapMinificationError("cssnano", error);
    }
}

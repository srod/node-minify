/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent, warnDeprecation } from "@node-minify/utils";
import minify from "sqwish";

/**
 * Minify CSS content with the Sqwish minifier and emit a deprecation warning.
 *
 * @deprecated sqwish is no longer maintained. Use @node-minify/cssnano or @node-minify/clean-css instead.
 * @param settings - Minifier options; `settings.options.strict` (if present) controls Sqwish strict mode
 * @param content - Content to minify; will be converted to a string if necessary
 * @returns An object containing the minified code in the `code` property
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

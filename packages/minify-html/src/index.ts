/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";

/**
 * Default options for minify-html.
 * Note: All options in @minify-html/node default to false,
 * so we enable CSS minification by default.
 * JS minification is disabled by default as minify-js can panic on some JS patterns.
 */
const defaultOptions = {
    minify_css: true,
    minify_js: false,
};

/**
 * Minifies HTML content using @minify-html/node (Rust-based).
 *
 * This is a high-performance HTML minifier written in Rust with Node.js bindings.
 * It uses lightningcss for CSS minification and oxc for JavaScript minification.
 *
 * @param settings - Minifier settings; `settings.options` are merged with defaults.
 * @param content - The HTML content to minify.
 * @returns An object containing the minified HTML as `code`.
 */
export async function minifyHtml({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "minify-html");

    const minifyHtmlLib = await import("@minify-html/node");
    const options = { ...defaultOptions, ...settings?.options };

    const inputBuffer = Buffer.from(contentStr);
    const outputBuffer = minifyHtmlLib.minify(inputBuffer, options);
    const code = outputBuffer.toString();

    return { code };
}

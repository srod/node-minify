/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import type { MinifierOptions } from "@node-minify/types";
import { utils } from "@node-minify/utils";
import minifier from "html-minifier";

/**
 * Module variables.
 */
const HTMLMinifier = minifier.minify;
const defaultOptions = {
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    removeAttributeQuotes: true,
    removeCDATASectionsFromCDATA: true,
    removeComments: true,
    removeCommentsFromCDATA: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
};

/**
 * Run html-minifier.
 * @param settings HTMLMinifier options
 * @param content Content to minify
 * @param callback Callback
 * @param index Index of current file in array
 * @returns Minified content
 */
const minifyHTMLMinifier = ({
    settings,
    content,
    callback,
    index,
}: MinifierOptions) => {
    const options = Object.assign({}, defaultOptions, settings?.options);
    const contentMinified = HTMLMinifier(content ?? "", options);
    if (settings && !settings.content && settings.output) {
        settings.output &&
            utils.writeFile({
                file: settings.output,
                content: contentMinified,
                index,
            });
    }
    if (callback) {
        return callback(null, contentMinified);
    }
    return contentMinified;
};

/**
 * Expose `minifyHTMLMinifier()`.
 */
minifyHTMLMinifier.default = minifyHTMLMinifier;
export default minifyHTMLMinifier;

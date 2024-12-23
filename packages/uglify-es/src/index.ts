/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import type { Dictionary, MinifierOptions } from "@node-minify/types";
import { utils } from "@node-minify/utils";
import uglifyES from "uglify-es";

type OptionsUglifyES = {
    sourceMap?: { filename: string };
};

type SettingsUglifyES = {
    options: OptionsUglifyES;
};

type MinifierOptionsUglifyES = {
    settings: SettingsUglifyES;
};

/**
 * Run uglifyES.
 * @param settings UglifyES options
 * @param content Content to minify
 * @param callback Callback
 * @param index Index of current file in array
 * @returns Minified content
 */
const minifyUglifyES = ({
    settings,
    content,
    callback,
    index,
}: MinifierOptions & MinifierOptionsUglifyES) => {
    let content2: string | Dictionary<string> = content ?? "";
    if (typeof settings.options.sourceMap === "object") {
        content2 = {
            [settings.options.sourceMap.filename ?? ""]: content ?? "",
        };
    }
    const contentMinified = uglifyES.minify(content2, settings.options);
    if (contentMinified.error) {
        if (callback) {
            return callback(contentMinified.error);
        }
    }
    if (contentMinified.map && settings.options.sourceMap) {
        utils.writeFile({
            file: `${settings.output}.map`,
            content: contentMinified.map,
            index,
        });
    }
    if (settings && !settings.content && settings.output) {
        utils.writeFile({
            file: settings.output,
            content: contentMinified.code,
            index,
        });
    }
    if (callback) {
        return callback(null, contentMinified.code);
    }
    return contentMinified.code;
};

/**
 * Expose `minifyUglifyES()`.
 */
minifyUglifyES.default = minifyUglifyES;
export default minifyUglifyES;

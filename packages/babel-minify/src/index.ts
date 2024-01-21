/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import { MinifierOptions } from "@node-minify/types";
import { utils } from "@node-minify/utils";
import { transform } from "babel-core";
import minify from "babel-preset-minify";

type BabelOptions = {
    presets: string[];
};

type OptionsBabel = {
    babelrc?: string;
};

type SettingsBabel = {
    options: OptionsBabel;
};

type MinifierOptionsBabel = {
    settings: SettingsBabel;
};

/**
 * Run babel-minify.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 * @param {Number} index
 */
const minifyBabel = ({
    settings,
    content,
    callback,
    index,
}: MinifierOptions & MinifierOptionsBabel) => {
    let babelOptions: BabelOptions = {
        presets: [],
    };

    if (settings?.options?.babelrc) {
        babelOptions = JSON.parse(utils.readFile(settings.options.babelrc));
    }

    if (settings?.options?.presets) {
        const babelrcPresets = babelOptions.presets || [];
        babelOptions.presets = babelrcPresets.concat(
            Array.isArray(settings.options.presets)
                ? settings.options.presets
                : []
        );
    }

    if (babelOptions.presets.indexOf("minify") === -1) {
        babelOptions.presets = babelOptions.presets.concat([minify]);
    }

    const contentMinified = transform(content ?? "", babelOptions);
    if (settings && !settings.content && settings.output) {
        settings.output &&
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
 * Expose `minifyBabel()`.
 */
minifyBabel.default = minifyBabel;
export = minifyBabel;

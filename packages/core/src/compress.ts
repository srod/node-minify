/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import fs from "node:fs";
import type { Settings } from "@node-minify/types";
import { utils } from "@node-minify/utils";
import { mkdirp } from "mkdirp";

/**
 * Run compressor.
 * @param settings Settings
 */
const compress = (settings: Settings): Promise<string> | string => {
    if (typeof settings.compressor !== "function") {
        throw new Error(
            "compressor should be a function, maybe you forgot to install the compressor"
        );
    }

    if (settings.output) {
        createDirectory(settings.output);
    }

    if (Array.isArray(settings.output)) {
        return settings.sync
            ? compressArrayOfFilesSync(settings)
            : compressArrayOfFilesAsync(settings);
    }
    return utils.compressSingleFile(settings);
};

/**
 * Compress an array of files in sync.
 * @param settings Settings
 */
const compressArrayOfFilesSync = (settings: Settings): any => {
    return (
        Array.isArray(settings.input) &&
        settings.input.forEach((input, index) => {
            const content = utils.getContentFromFiles(input);
            return utils.runSync({ settings, content, index });
        })
    );
};

/**
 * Compress an array of files in async.
 * @param settings Settings
 */
const compressArrayOfFilesAsync = (
    settings: Settings
): Promise<string | void> => {
    let sequence: Promise<string | void> = Promise.resolve();
    Array.isArray(settings.input) &&
        settings.input.forEach((input, index) => {
            const content = utils.getContentFromFiles(input);
            sequence = sequence.then(() =>
                utils.runAsync({ settings, content, index })
            );
        });
    return sequence;
};

/**
 * Create folder of the target file.
 * @param file Full path of the file
 */
const createDirectory = (file: string) => {
    if (Array.isArray(file)) {
        file = file[0];
    }
    const dir = file?.substr(0, file.lastIndexOf("/"));
    if (!dir) {
        return;
    }
    if (!fs.statSync(dir).isDirectory()) {
        mkdirp.sync(dir);
    }
};

/**
 * Expose `compress()`.
 */
export { compress };

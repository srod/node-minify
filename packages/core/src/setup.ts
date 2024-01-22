/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import path from "path";
import { Settings } from "@node-minify/types";
import { utils } from "@node-minify/utils";
import { globSync } from "glob";

/**
 * Default settings.
 */
const defaultSettings = {
    sync: false,
    options: {},
    buffer: 1000 * 1024,
    callback: false,
};

/**
 * Run setup.
 * @param inputSettings Settings from user input
 */
const setup = (inputSettings: Settings) => {
    let settings: Settings = Object.assign(
        utils.clone(defaultSettings),
        inputSettings
    );

    // In memory
    if (settings.content) {
        checkMandatoriesMemoryContent(inputSettings);
        return settings;
    }

    checkMandatories(inputSettings);

    if (settings.input) {
        settings = Object.assign(
            settings,
            wildcards(settings.input, settings.publicFolder)
        );
    }
    if (settings.input && settings.output) {
        settings = Object.assign(
            settings,
            checkOutput(
                settings.input,
                settings.output,
                settings.publicFolder,
                settings.replaceInPlace
            )
        );
    }
    if (settings.input && settings.publicFolder) {
        settings = Object.assign(
            settings,
            setPublicFolder(settings.input, settings.publicFolder)
        );
    }

    return settings;
};

/**
 * Check the output path, searching for $1
 * if exist, returns the path replacing $1 by file name
 * @param input Path file
 * @param output Path to the output file
 * @param publicFolder Path to the public folder
 * @param replaceInPlace True to replace file in same folder
 */
const checkOutput = (
    input: string | string[],
    output: string,
    publicFolder?: string,
    replaceInPlace?: boolean
) => {
    const reg = /\$1/;
    if (reg.test(output)) {
        if (Array.isArray(input)) {
            const outputMin = input.map((file) =>
                utils.setFileNameMin(
                    file,
                    output,
                    replaceInPlace ? undefined : publicFolder,
                    replaceInPlace
                )
            );
            return { output: outputMin };
        }
        return {
            output: utils.setFileNameMin(
                input,
                output,
                replaceInPlace ? undefined : publicFolder,
                replaceInPlace
            ),
        };
    }
};

/**
 * Handle wildcards in a path, get the real path of each files.
 * @param input Path with wildcards
 * @param publicFolder Path to the public folder
 */
const wildcards = (input: string | string[], publicFolder?: string) => {
    // If it's a string
    if (!Array.isArray(input)) {
        return wildcardsString(input, publicFolder);
    }

    return wildcardsArray(input, publicFolder);
};

/**
 * Handle wildcards in a path (string only), get the real path of each files.
 * @param input Path with wildcards
 * @param publicFolder Path to the public folder
 */
const wildcardsString = (input: string, publicFolder?: string) => {
    const output: { input?: string[] } = {};

    if (input.indexOf("*") > -1) {
        output.input = getFilesFromWildcards(input, publicFolder);
    }

    return output;
};

/**
 * Handle wildcards in a path (array only), get the real path of each files.
 * @param input Path with wildcards
 * @param publicFolder Path to the public folder
 */
const wildcardsArray = (input: string[], publicFolder?: string) => {
    const output: { input?: string[] } = {};
    let isWildcardsPresent = false;

    output.input = input;

    // Transform all wildcards to path file
    const inputWithPublicFolder = input.map((item) => {
        if (item.indexOf("*") > -1) {
            isWildcardsPresent = true;
        }
        return (publicFolder || "") + item;
    });

    if (isWildcardsPresent) {
        output.input = globSync(inputWithPublicFolder);
    }

    // Remove all wildcards from array
    for (let i = 0; i < output.input.length; i++) {
        if (output.input[i].indexOf("*") > -1) {
            output.input.splice(i, 1);

            i--;
        }
    }

    return output;
};

/**
 * Get the real path of each files.
 * @param input Path with wildcards
 * @param publicFolder Path to the public folder
 */
const getFilesFromWildcards = (input: string, publicFolder?: string) => {
    let output: string[] = [];

    if (input.indexOf("*") > -1) {
        output = globSync((publicFolder || "") + input);
    }

    return output;
};

/**
 * Prepend the public folder to each file.
 * @param input Path to file(s)
 * @param publicFolder Path to the public folder
 */
const setPublicFolder = (input: string | string[], publicFolder: string) => {
    const output: { input?: string | string[] } = {};

    if (typeof publicFolder !== "string") {
        return output;
    }

    publicFolder = path.normalize(publicFolder);

    if (Array.isArray(input)) {
        output.input = input.map((item) => {
            // Check if publicFolder is already in path
            if (path.normalize(item).indexOf(publicFolder) > -1) {
                return item;
            }
            return path.normalize(publicFolder + item);
        });
        return output;
    }

    input = path.normalize(input);

    // Check if publicFolder is already in path
    if (input.indexOf(publicFolder) > -1) {
        output.input = input;
        return output;
    }

    output.input = path.normalize(publicFolder + input);

    return output;
};

/**
 * Check if some settings are here.
 * @param settings Settings
 */
const checkMandatories = (settings: Settings) => {
    ["compressor", "input", "output"].forEach((item: string) =>
        mandatory(item, settings)
    );
};

/**
 * Check if some settings are here for memory content.
 * @param settings Settings
 */
const checkMandatoriesMemoryContent = (settings: Settings) => {
    ["compressor", "content"].forEach((item: string) =>
        mandatory(item, settings)
    );
};

/**
 * Check if the setting exist.
 * @param setting Setting
 * @param settings Settings
 */
const mandatory = (setting: string, settings: { [key: string]: any }) => {
    if (!settings[setting]) {
        throw new Error(`${setting} is mandatory.`);
    }
};

/**
 * Expose `setup()`.
 */
export { setup };

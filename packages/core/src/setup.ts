/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import os from "node:os";
import path from "node:path";
import type { Settings } from "@node-minify/types";
import { setFileNameMin } from "@node-minify/utils";
import fg from "fast-glob";

/**
 * Check if the platform is Windows
 */
const IS_WINDOWS_PLATFORM = os.platform() === "win32";

/**
 * Default settings.
 */
const defaultSettings = {
    options: {},
    buffer: 1000 * 1024,
};

/**
 * Run setup.
 * @param inputSettings Settings from user input
 */
function setup(inputSettings: Settings) {
    const settings: Settings = Object.assign(
        structuredClone(defaultSettings),
        inputSettings
    );

    // In memory
    if (settings.content) {
        validateMandatoryFields(inputSettings, ["compressor", "content"]);
        return settings;
    }

    validateMandatoryFields(inputSettings, ["compressor", "input", "output"]);

    return enhanceSettings(settings);
}

/**
 * Enhance settings.
 */
function enhanceSettings(settings: Settings): Settings {
    let enhancedSettings = settings;

    if (settings.input) {
        enhancedSettings = Object.assign(
            settings,
            wildcards(settings.input, settings.publicFolder)
        );
    }
    if (settings.input && settings.output && !Array.isArray(settings.output)) {
        enhancedSettings = Object.assign(
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
        enhancedSettings = Object.assign(
            settings,
            setPublicFolder(settings.input, settings.publicFolder)
        );
    }

    return enhancedSettings;
}

/**
 * Check the output path, searching for $1
 * if exist, returns the path replacing $1 by file name
 * @param input Path file
 * @param output Path to the output file
 * @param publicFolder Path to the public folder
 * @param replaceInPlace True to replace file in same folder
 * @returns Enhanced settings with processed output, or undefined if no processing needed
 */
function checkOutput(
    input: string | string[],
    output: string | string[],
    publicFolder?: string,
    replaceInPlace?: boolean
): { output: string | string[] } | undefined {
    // Arrays don't use the $1 placeholder pattern - they're handled directly in compress()
    if (Array.isArray(output)) {
        return undefined;
    }

    const PLACEHOLDER_PATTERN = /\$1/;

    if (!PLACEHOLDER_PATTERN.test(output)) {
        return undefined;
    }

    const effectivePublicFolder = replaceInPlace ? undefined : publicFolder;

    // If array of files
    if (Array.isArray(input)) {
        const outputMin = input.map((file) =>
            setFileNameMin(file, output, effectivePublicFolder, replaceInPlace)
        );
        return { output: outputMin };
    }

    // Single file
    return {
        output: setFileNameMin(
            input,
            output,
            effectivePublicFolder,
            replaceInPlace
        ),
    };
}

/**
 * Handle wildcards in a path, get the real path of each file.
 * @param input - Path with wildcards
 * @param publicFolder - Path to the public folder
 */
function wildcards(input: string | string[], publicFolder?: string) {
    if (Array.isArray(input)) {
        return wildcardsArray(input, publicFolder);
    }

    return wildcardsString(input, publicFolder);
}

/**
 * Handle wildcards in a path (string only), get the real path of each file.
 * @param input - Path with wildcards
 * @param publicFolder - Path to the public folder
 */
function wildcardsString(input: string, publicFolder?: string) {
    if (!input.includes("*")) {
        return {};
    }

    return {
        input: getFilesFromWildcards(input, publicFolder),
    };
}

/**
 * Handle wildcards in a path (array only), get the real path of each file.
 * @param input - Array of paths with wildcards
 * @param publicFolder - Path to the public folder
 */
function wildcardsArray(input: string[], publicFolder?: string) {
    // Convert input paths to patterns with public folder prefix
    const inputWithPublicFolder = input.map((item) => {
        const input2 = publicFolder ? publicFolder + item : item;
        return IS_WINDOWS_PLATFORM ? fg.convertPathToPattern(input2) : input2;
    });

    // Check if any wildcards exist
    const hasWildcards = inputWithPublicFolder.some((item) =>
        item.includes("*")
    );

    // Process paths based on whether wildcards exist
    const processedPaths = hasWildcards
        ? fg.globSync(inputWithPublicFolder)
        : input;

    // Filter out any remaining paths with wildcards
    const finalPaths = processedPaths.filter((path) => !path.includes("*"));

    return { input: finalPaths };
}

/**
 * Get the real path of each file.
 * @param input - Path with wildcards
 * @param publicFolder - Path to the public folder
 */
function getFilesFromWildcards(input: string, publicFolder?: string) {
    const fullPath = publicFolder ? `${publicFolder}${input}` : input;
    return input.includes("*")
        ? fg.globSync(
              IS_WINDOWS_PLATFORM ? fg.convertPathToPattern(fullPath) : fullPath
          )
        : [];
}

/**
 * Prepend the public folder to each file.
 * @param input Path to file(s)
 * @param publicFolder Path to the public folder
 */
function setPublicFolder(input: string | string[], publicFolder: string) {
    if (typeof publicFolder !== "string") {
        return {};
    }

    const normalizedPublicFolder = path.normalize(publicFolder);

    const addPublicFolder = (item: string) => {
        const normalizedPath = path.normalize(item);
        return normalizedPath.includes(normalizedPublicFolder)
            ? normalizedPath
            : path.normalize(normalizedPublicFolder + item);
    };

    return {
        input: Array.isArray(input)
            ? input.map(addPublicFolder)
            : addPublicFolder(input),
    };
}

/**
 * Validate that mandatory fields are present in settings.
 * @param settings - Settings object to validate
 * @param fields - Array of required field names
 */
function validateMandatoryFields(settings: Settings, fields: string[]) {
    for (const field of fields) {
        mandatory(field, settings);
    }

    if (typeof settings.compressor !== "function") {
        throw new Error(
            "compressor should be a function, maybe you forgot to install the compressor"
        );
    }
}

/**
 * Check if the setting exists.
 * @param setting - Setting key to check
 * @param settings - Settings object
 */
function mandatory(setting: string, settings: { [key: string]: any }) {
    if (!settings[setting]) {
        throw new Error(`${setting} is mandatory.`);
    }
}

export { setup };

/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import type { Settings } from "@node-minify/types";
import { setFileNameMin, setPublicFolder, wildcards } from "@node-minify/utils";

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
    const settings: Settings = {
        ...structuredClone(defaultSettings),
        ...inputSettings,
    };

    // In memory
    if (settings.content) {
        validateMandatoryFields(inputSettings, ["compressor", "content"]);
        return settings;
    }

    validateMandatoryFields(inputSettings, ["compressor", "input", "output"]);

    if (Array.isArray(settings.input)) {
        settings.input.forEach((input, index) => {
            if (!input || typeof input !== "string") {
                throw new Error(
                    `Invalid input at index ${index}: expected non-empty string, got ${
                        typeof input === "string"
                            ? "empty string"
                            : typeof input
                    }`
                );
            }
        });
    }

    return enhanceSettings(settings);
}

/**
 * Enhance settings.
 */
function enhanceSettings(settings: Settings): Settings {
    let enhancedSettings = settings;

    if (enhancedSettings.input) {
        enhancedSettings = {
            ...enhancedSettings,
            ...wildcards(enhancedSettings.input, enhancedSettings.publicFolder),
        };
    }
    if (
        enhancedSettings.input &&
        enhancedSettings.output &&
        !Array.isArray(enhancedSettings.output)
    ) {
        enhancedSettings = {
            ...enhancedSettings,
            ...checkOutput(
                enhancedSettings.input,
                enhancedSettings.output,
                enhancedSettings.publicFolder,
                enhancedSettings.replaceInPlace
            ),
        };
    }
    if (enhancedSettings.input && enhancedSettings.publicFolder) {
        enhancedSettings = {
            ...enhancedSettings,
            ...setPublicFolder(
                enhancedSettings.input,
                enhancedSettings.publicFolder
            ),
        };
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
function mandatory(setting: string, settings: Record<string, unknown>) {
    if (!settings[setting]) {
        throw new Error(`${setting} is mandatory.`);
    }
}

export { setup };

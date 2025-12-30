/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import type { CompressorOptions, Settings } from "@node-minify/types";
import { setFileNameMin, setPublicFolder, wildcards } from "@node-minify/utils";

/**
 * Default settings.
 */
const defaultSettings: Partial<Settings> = {
    options: {},
    buffer: 1000 * 1024,
};

/**
 * Prepare and validate compressor settings by merging defaults with user input.
 *
 * If `inputSettings` contains `content`, validates required in-memory fields and returns the merged settings.
 * Otherwise, validates file-based fields and returns settings enhanced for file input/output handling.
 *
 * @param inputSettings - User-provided settings; may include `content` for in-memory compression or `input`/`output` for file-based compression
 * @returns The resulting `Settings<T>` object merged with defaults and adjusted for in-memory or file-based operation
 */
function setup<T extends CompressorOptions = CompressorOptions>(
    inputSettings: Settings<T>
): Settings<T> {
    const settings: Settings<T> = {
        ...structuredClone(defaultSettings),
        ...inputSettings,
    } as Settings<T>;

    // In memory
    if (settings.content) {
        validateMandatoryFields(inputSettings, ["compressor", "content"]);
        return settings;
    }

    validateMandatoryFields(inputSettings, ["compressor", "input", "output"]);

    return enhanceSettings(settings);
}

/**
 * Normalize and augment settings by expanding input wildcards, resolving output paths, and applying public-folder context when present.
 *
 * @param settings - The settings to enhance
 * @returns The settings augmented with expanded `input`, a resolved `output` when applicable, and any applied `publicFolder` context
 */
function enhanceSettings<T extends CompressorOptions = CompressorOptions>(
    settings: Settings<T>
): Settings<T> {
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
 * Ensures required setting keys exist and that the `compressor` property is a function.
 *
 * @param settings - The settings object to check
 * @param fields - Names of keys that must be present on `settings`
 * @throws If `settings.compressor` is not a function
 */
function validateMandatoryFields<
    T extends CompressorOptions = CompressorOptions,
>(settings: Settings<T>, fields: string[]) {
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
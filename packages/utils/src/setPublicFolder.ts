/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import path from "node:path";

/**
 * Ensure each input path is rooted in the given public folder.
 *
 * If `publicFolder` is not a string, returns an empty object. Otherwise,
 * each provided path is normalized and, if it does not already contain the
 * normalized `publicFolder`, that folder is prepended.
 *
 * @param input - A single file path or an array of file paths to adjust
 * @param publicFolder - Path to the public folder to prepend when missing
 * @returns An object with an `input` property containing the processed path or array of paths; or an empty object if `publicFolder` is not a string
 */
export function setPublicFolder(
    input: string | string[],
    publicFolder: string
) {
    if (typeof publicFolder !== "string") {
        return {};
    }

    const normalizedPublicFolder = path.normalize(publicFolder);

    const addPublicFolder = (item: string) => {
        const normalizedPath = path.normalize(item);
        return normalizedPath.includes(normalizedPublicFolder)
            ? normalizedPath
            : path.join(normalizedPublicFolder, item);
    };

    return {
        input: Array.isArray(input)
            ? input.map(addPublicFolder)
            : addPublicFolder(input),
    };
}
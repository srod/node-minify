/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import path from "node:path";

/**
 * Prepend the public folder to each file.
 * @param input Path to file(s)
 * @param publicFolder Path to the public folder
 * @returns Object containing the updated input path(s), or an empty object if `publicFolder` is invalid
 */
export function setPublicFolder(
    input: string | string[],
    publicFolder: string
) {
    if (typeof publicFolder !== "string") {
        return {};
    }

    const normalizedPublicFolder = path.normalize(publicFolder);

    const isAlreadyInPublicFolder = (filePath: string) => {
        const relativePath = path.relative(normalizedPublicFolder, filePath);
        return (
            relativePath === "" ||
            (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
        );
    };

    const addPublicFolder = (item: string) => {
        const normalizedPath = path.normalize(item);
        return isAlreadyInPublicFolder(normalizedPath)
            ? normalizedPath
            : path.join(normalizedPublicFolder, normalizedPath);
    };

    return {
        input: Array.isArray(input)
            ? input.map(addPublicFolder)
            : addPublicFolder(input),
    };
}

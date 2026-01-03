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
            : path.normalize(normalizedPublicFolder + item);
    };

    return {
        input: Array.isArray(input)
            ? input.map(addPublicFolder)
            : addPublicFolder(input),
    };
}

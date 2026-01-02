/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

const IMAGE_EXTENSIONS = new Set([
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".avif",
    ".tiff",
    ".tif",
    ".heif",
    ".heic",
    ".svg",
]);

/**
 * Determines whether a file path refers to a supported image file by its extension.
 *
 * @param filePath - The file name or path to check; may include directories.
 * @returns `true` if the path ends with a recognized image extension, `false` otherwise.
 */
export function isImageFile(filePath: string): boolean {
    const lastDot = filePath.lastIndexOf(".");
    if (lastDot === -1) return false;
    const ext = filePath.slice(lastDot).toLowerCase();
    return IMAGE_EXTENSIONS.has(ext);
}

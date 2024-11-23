/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Set the file name as minified.
 * eg. file.js returns file.min.js
 * @param file File name
 * @param output Output file name
 * @param publicFolder Public folder
 * @param replaceInPlace Replace in place
 */
export function setFileNameMin(
    file: string,
    output: string,
    publicFolder?: string,
    replaceInPlace?: boolean
): string {
    const filePath = file.substring(0, file.lastIndexOf("/") + 1);
    const fileWithoutPath = file.substring(file.lastIndexOf("/") + 1);
    let fileWithoutExtension = fileWithoutPath.substring(
        0,
        fileWithoutPath.lastIndexOf(".")
    );
    if (publicFolder) {
        fileWithoutExtension = publicFolder + fileWithoutExtension;
    }
    if (replaceInPlace) {
        fileWithoutExtension = filePath + fileWithoutExtension;
    }
    return output.replace("$1", fileWithoutExtension);
}

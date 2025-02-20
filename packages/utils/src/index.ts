import { buildArgs } from "./buildArgs.ts";
import {
    compressSingleFileAsync,
    compressSingleFileSync,
} from "./compressSingleFile.ts";
import { deleteFile } from "./deleteFile.ts";
import { getContentFromFiles } from "./getContentFromFiles.ts";
import { getFilesizeGzippedInBytes } from "./getFilesizeGzippedInBytes.ts";
import { getFilesizeInBytes } from "./getFilesizeInBytes.ts";
import { isValidFile } from "./isValidFile.ts";
import { prettyBytes } from "./prettyBytes.ts";
import { readFile } from "./readFile.ts";
import { runAsync } from "./runAsync.ts";
import { runSync } from "./runSync.ts";
import { setFileNameMin } from "./setFileNameMin.ts";
import { writeFile } from "./writeFile.ts";

export {
    buildArgs,
    compressSingleFileSync,
    compressSingleFileAsync,
    deleteFile,
    getContentFromFiles,
    getFilesizeGzippedInBytes,
    getFilesizeInBytes,
    isValidFile,
    prettyBytes,
    readFile,
    runAsync,
    runSync,
    setFileNameMin,
    writeFile,
};

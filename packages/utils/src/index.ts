import { buildArgs, toBuildArgsOptions } from "./buildArgs.ts";
import { compressSingleFile } from "./compressSingleFile.ts";
import { deleteFile } from "./deleteFile.ts";
import { resetDeprecationWarnings, warnDeprecation } from "./deprecation.ts";
import { ensureStringContent } from "./ensureStringContent.ts";
import {
    getContentFromFiles,
    getContentFromFilesAsync,
} from "./getContentFromFiles.ts";
import { getFilesizeGzippedInBytes } from "./getFilesizeGzippedInBytes.ts";
import { getFilesizeInBytes } from "./getFilesizeInBytes.ts";
import { isValidFile, isValidFileAsync } from "./isValidFile.ts";
import { prettyBytes } from "./prettyBytes.ts";
import { readFile } from "./readFile.ts";
import { run } from "./run.ts";
import { setFileNameMin } from "./setFileNameMin.ts";
import { setPublicFolder } from "./setPublicFolder.ts";
import type { BuildArgsOptions } from "./types.ts";
import { wildcards } from "./wildcards.ts";
import { writeFile } from "./writeFile.ts";

export {
    buildArgs,
    compressSingleFile,
    deleteFile,
    ensureStringContent,
    getContentFromFiles,
    getContentFromFilesAsync,
    getFilesizeGzippedInBytes,
    getFilesizeInBytes,
    isValidFile,
    isValidFileAsync,
    prettyBytes,
    readFile,
    resetDeprecationWarnings,
    run,
    setFileNameMin,
    setPublicFolder,
    toBuildArgsOptions,
    warnDeprecation,
    wildcards,
    writeFile,
};

export type { BuildArgsOptions };

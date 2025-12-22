import { buildArgs } from "./buildArgs.ts";
import { compressSingleFile } from "./compressSingleFile.ts";
import { deleteFile } from "./deleteFile.ts";
import { resetDeprecationWarnings, warnDeprecation } from "./deprecation.ts";
import { getContentFromFiles } from "./getContentFromFiles.ts";
import { getFilesizeGzippedInBytes } from "./getFilesizeGzippedInBytes.ts";
import { getFilesizeInBytes } from "./getFilesizeInBytes.ts";
import { isValidFile } from "./isValidFile.ts";
import { prettyBytes } from "./prettyBytes.ts";
import { readFile } from "./readFile.ts";
import { run } from "./run.ts";
import { setFileNameMin } from "./setFileNameMin.ts";
import type { BuildArgsOptions } from "./types.ts";
import { writeFile } from "./writeFile.ts";

export {
    buildArgs,
    compressSingleFile,
    deleteFile,
    getContentFromFiles,
    getFilesizeGzippedInBytes,
    getFilesizeInBytes,
    isValidFile,
    prettyBytes,
    readFile,
    resetDeprecationWarnings,
    run,
    setFileNameMin,
    warnDeprecation,
    writeFile,
};

export type { BuildArgsOptions };

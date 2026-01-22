import { buildArgs, toBuildArgsOptions } from "./buildArgs.ts";
import {
    getKnownExportName,
    isBuiltInCompressor,
    isLocalPath,
    resolveCompressor,
    tryResolveBuiltIn,
    tryResolveLocalFile,
    tryResolveNpmPackage,
} from "./compressor-resolver.ts";
import { compressSingleFile } from "./compressSingleFile.ts";
import { deleteFile } from "./deleteFile.ts";
import { resetDeprecationWarnings, warnDeprecation } from "./deprecation.ts";
import { ensureStringContent } from "./ensureStringContent.ts";
import { validateMinifyResult, wrapMinificationError } from "./errors.ts";
import {
    getContentFromFiles,
    getContentFromFilesAsync,
} from "./getContentFromFiles.ts";
import {
    getFilesizeBrotliInBytes,
    getFilesizeBrotliRaw,
} from "./getFilesizeBrotliInBytes.ts";
import {
    getFilesizeGzippedInBytes,
    getFilesizeGzippedRaw,
} from "./getFilesizeGzippedInBytes.ts";
import { getFilesizeInBytes } from "./getFilesizeInBytes.ts";
import { isImageFile } from "./isImageFile.ts";
import { isValidFile, isValidFileAsync } from "./isValidFile.ts";
import { prettyBytes } from "./prettyBytes.ts";
import { readFile, readFileAsync } from "./readFile.ts";
import { run } from "./run.ts";
import { setFileNameMin } from "./setFileNameMin.ts";
import { setPublicFolder } from "./setPublicFolder.ts";
import type { BuildArgsOptions } from "./types.ts";
import { wildcards } from "./wildcards.ts";
import { writeFile, writeFileAsync } from "./writeFile.ts";

export {
    buildArgs,
    compressSingleFile,
    deleteFile,
    ensureStringContent,
    getContentFromFiles,
    getContentFromFilesAsync,
    getFilesizeBrotliInBytes,
    getFilesizeBrotliRaw,
    getFilesizeGzippedInBytes,
    getFilesizeGzippedRaw,
    getFilesizeInBytes,
    getKnownExportName,
    isBuiltInCompressor,
    isImageFile,
    isLocalPath,
    isValidFile,
    isValidFileAsync,
    prettyBytes,
    readFile,
    readFileAsync,
    resetDeprecationWarnings,
    resolveCompressor,
    run,
    setFileNameMin,
    setPublicFolder,
    toBuildArgsOptions,
    tryResolveBuiltIn,
    tryResolveLocalFile,
    tryResolveNpmPackage,
    validateMinifyResult,
    warnDeprecation,
    wildcards,
    wrapMinificationError,
    writeFile,
    writeFileAsync,
};

export type { BuildArgsOptions };
export type { CompressorResolution } from "./compressor-resolver.ts";

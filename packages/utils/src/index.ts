/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import {
    createReadStream,
    existsSync,
    lstatSync,
    readFileSync,
    statSync,
    unlinkSync,
    writeFileSync,
} from "node:fs";
import type {
    CompressorReturnType,
    MinifierOptions,
    Settings,
} from "@node-minify/types";

type Utils = {
    readFile: (file: string) => string;
    writeFile: ({ file, content, index }: WriteFileParams) => string;
    deleteFile: (file: string) => void;
    buildArgs: (options: Record<string, unknown>) => any;
    getFilesizeInBytes: (file: string) => string;
    getFilesizeGzippedInBytes: (file: string) => Promise<string>;
    prettyBytes: (num: number) => string;
    setFileNameMin: (
        file: string,
        output: string,
        publicFolder?: string,
        replaceInPlace?: boolean
    ) => string;
    compressSingleFile: (settings: Settings) => CompressorReturnType;
    getContentFromFiles: (input: string | string[]) => string;
    runSync: ({
        settings,
        content,
        index,
    }: MinifierOptions) => CompressorReturnType;
    runAsync: ({
        settings,
        content,
        index,
    }: MinifierOptions) => Promise<string>;
};

const utils = {} as Utils;

/**
 * Read content from file.
 * @param file File name
 */
utils.readFile = (file: string): string => readFileSync(file, "utf8");

/**
 * Write content into file.
 * @param file File name
 * @param content Content to write
 * @param index Index of the file being processed
 */
type WriteFileParams = {
    file: string;
    content: any;
    index?: number;
};
utils.writeFile = ({ file, content, index }: WriteFileParams): string => {
    const targetFile = index !== undefined ? file[index] : file;

    if (!targetFile) {
        throw new Error("No target file provided");
    }

    const shouldWrite =
        !existsSync(targetFile) || !lstatSync(targetFile).isDirectory();

    if (shouldWrite) {
        writeFileSync(targetFile, content, "utf8");
    }

    return content;
};

/**
 * Delete file.
 * @param file File name
 */
utils.deleteFile = (file: string) => unlinkSync(file);

/**
 * Builds arguments array based on an object.
 * @param options
 */
utils.buildArgs = (options: Record<string, unknown>): unknown[] => {
    const args: unknown[] = [];
    Object.keys(options).forEach((key: string) => {
        if (options[key] && (options[key] as unknown) !== false) {
            args.push(`--${key}`);
        }

        if (options[key] && options[key] !== true) {
            args.push(options[key]);
        }
    });

    return args;
};

/**
 * Get the file size in bytes.
 * @param file File name
 */
utils.getFilesizeInBytes = (file: string): string => {
    const stats = statSync(file);
    const fileSizeInBytes = stats.size;
    return utils.prettyBytes(fileSizeInBytes);
};

/**
 * Get the gzipped file size in bytes.
 * @param file File name
 */
utils.getFilesizeGzippedInBytes = async (file: string): Promise<string> => {
    const { gzipSizeStream } = await import("gzip-size");
    const source = createReadStream(file);
    const size = await new Promise<number>((resolve) => {
        source.pipe(gzipSizeStream()).on("gzip-size", resolve);
    });
    return utils.prettyBytes(size);
};

/**
 * Get the size in human readable.
 * From https://github.com/sindresorhus/pretty-bytes
 * @param num Number
 */
utils.prettyBytes = (num: number): string => {
    const UNITS = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    if (!Number.isFinite(num)) {
        throw new TypeError(
            `Expected a finite number, got ${typeof num}: ${num}`
        );
    }

    const neg = num < 0;

    if (neg) {
        num = -num;
    }

    if (num < 1) {
        return `${(neg ? "-" : "") + num} B`;
    }

    const exponent = Math.min(
        Math.floor(Math.log(num) / Math.log(1000)),
        UNITS.length - 1
    );
    const numStr = Number((num / 1000 ** exponent).toPrecision(3));
    const unit = UNITS[exponent];

    return `${(neg ? "-" : "") + numStr} ${unit}`;
};

/**
 * Set the file name as minified.
 * eg. file.js returns file.min.js
 * @param file File name
 * @param output Output file name
 * @param publicFolder Public folder
 * @param replaceInPlace Replace in place
 */
utils.setFileNameMin = (
    file: string,
    output: string,
    publicFolder?: string,
    replaceInPlace?: boolean
): string => {
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
};

/**
 * Compress a single file.
 * @param settings Settings
 */
utils.compressSingleFile = (settings: Settings): CompressorReturnType => {
    const content = determineContent(settings);
    return executeCompression(settings, content);
};

/**
 * Determine the content to minify.
 * @param settings
 * @returns
 */
const determineContent = (settings: Settings): string => {
    if (settings.content) {
        return settings.content;
    }

    if (settings.input) {
        return utils.getContentFromFiles(settings.input);
    }

    return "";
};

/**
 * Execute compression.
 * @param settings
 * @param content
 * @returns
 */
function executeCompression(
    settings: Settings,
    content: string
): CompressorReturnType {
    return settings.sync
        ? utils.runSync({ settings, content })
        : utils.runAsync({ settings, content });
}

/**
 * Check if the path is a valid file.
 * @param path
 * @returns
 */
const isValidFile = (path: string): boolean => {
    return existsSync(path) && !lstatSync(path).isDirectory();
};

/**
 * Read file.
 * @param path
 * @returns
 */
const readFile = (path: string): string => {
    if (!existsSync(path) || isValidFile(path)) {
        return readFileSync(path, "utf8");
    }
    return "";
};

/**
 * Concatenate all input files and get the data.
 * @param input Input files
 */
utils.getContentFromFiles = (input: string | string[]): string => {
    if (!Array.isArray(input)) {
        return readFile(input);
    }

    return input.map(readFile).join("\n");
};

/**
 * Run compressor in sync.
 * @param settings Settings
 * @param content Content to minify
 * @param index Index of the file being processed
 */
type RunSyncParameters = {
    settings: Settings;
    content?: string;
    index?: number;
};
utils.runSync = ({
    settings,
    content,
    index,
}: RunSyncParameters): CompressorReturnType =>
    settings.compressor({
        settings,
        content,
        callback: undefined,
        index,
    });

/**
 * Run compressor in async.
 * @param settings Settings
 * @param content Content to minify
 * @param index Index of the file being processed
 */
type RunAsyncParameters = {
    settings: Settings;
    content?: string;
    index?: number;
};
utils.runAsync = async ({
    settings,
    content,
    index,
}: RunAsyncParameters): Promise<string> => {
    return new Promise((resolve, reject) => {
        settings.compressor({
            settings,
            content,
            callback: (err: unknown, result?: string) =>
                err ? reject(err) : resolve(result as string),
            index,
        });
    });
};

/**
 * Expose `utils`.
 */
export { utils };

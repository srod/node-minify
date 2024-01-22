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
import { MinifierOptions, OptionsPossible, Settings } from "@node-minify/types";
import gzipSize from "gzip-size";

type Utils = {
    readFile: (file: string) => string;
    writeFile: ({ file, content, index }: WriteFile) => string;
    deleteFile: (file: string) => void;
    buildArgs: (options: Record<string, OptionsPossible>) => any;
    clone: (obj: object) => object;
    getFilesizeInBytes: (file: string) => string;
    getFilesizeGzippedInBytes: (file: string) => Promise<string>;
    prettyBytes: (num: number) => string;
    setFileNameMin: (
        file: string,
        output: string,
        publicFolder?: string,
        replaceInPlace?: boolean
    ) => string;
    compressSingleFile: (settings: Settings) => string | Promise<string>;
    getContentFromFiles: (input: string | string[]) => string;
    runSync: ({ settings, content, index }: MinifierOptions) => string;
    runAsync: ({
        settings,
        content,
        index,
    }: MinifierOptions) => Promise<string>;
};

type WriteFile = {
    file: string;
    content: any;
    index?: number;
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
utils.writeFile = ({ file, content, index }: WriteFile): string => {
    const _file = index !== undefined ? file[index] : file;
    if (
        !existsSync(_file) ||
        (existsSync(_file) && !lstatSync(_file).isDirectory())
    ) {
        writeFileSync(_file, content, "utf8");
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
utils.buildArgs = (
    options: Record<string, OptionsPossible>
): OptionsPossible[] => {
    const args: OptionsPossible[] = [];
    Object.keys(options).forEach((key: string) => {
        if (options[key] && options[key] !== false) {
            args.push(`--${key}`);
        }

        if (options[key] && options[key] !== true) {
            args.push(options[key]);
        }
    });

    return args;
};

/**
 * Clone an object.
 * @param obj Object
 */
utils.clone = (obj: object): object => JSON.parse(JSON.stringify(obj));

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
utils.getFilesizeGzippedInBytes = (file: string): Promise<string> => {
    return new Promise((resolve) => {
        const source = createReadStream(file);
        source.pipe(gzipSize.stream()).on("gzip-size", (size) => {
            resolve(utils.prettyBytes(size));
        });
    });
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
    const filePath = file.substr(0, file.lastIndexOf("/") + 1);
    const fileWithoutPath = file.substr(file.lastIndexOf("/") + 1);
    let fileWithoutExtension = fileWithoutPath.substr(
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
utils.compressSingleFile = (settings: Settings): Promise<string> | string => {
    const content = settings.content
        ? settings.content
        : settings.input
          ? utils.getContentFromFiles(settings.input)
          : "";
    return settings.sync
        ? utils.runSync({ settings, content })
        : utils.runAsync({ settings, content });
};

/**
 * Concatenate all input files and get the data.
 * @param input Input files
 */
utils.getContentFromFiles = (input: string | string[]): string => {
    if (!Array.isArray(input)) {
        return readFileSync(input, "utf8");
    }

    return input
        .map((path) =>
            !existsSync(path) ||
            (existsSync(path) && !lstatSync(path).isDirectory())
                ? readFileSync(path, "utf8")
                : ""
        )
        .join("\n");
};

/**
 * Run compressor in sync.
 * @param settings Settings
 * @param content Content to minify
 * @param index Index of the file being processed
 */
utils.runSync = ({ settings, content, index }: MinifierOptions): string =>
    settings && typeof settings.compressor !== "string"
        ? typeof settings.compressor === "function"
            ? settings.compressor({ settings, content, callback: null, index })
            : ""
        : "";

/**
 * Run compressor in async.
 * @param settings Settings
 * @param content Content to minify
 * @param index Index of the file being processed
 */
utils.runAsync = ({
    settings,
    content,
    index,
}: MinifierOptions): Promise<string> => {
    return new Promise((resolve, reject) => {
        settings?.compressor && typeof settings.compressor !== "string"
            ? settings.compressor({
                  settings,
                  content,
                  callback: (err: unknown, result?: string) => {
                      if (err) {
                          return reject(err);
                      }
                      resolve(result || "");
                  },
                  index,
              })
            : null;
    });
};

/**
 * Expose `utils`.
 */
export { utils };

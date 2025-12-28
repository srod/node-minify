import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Settings } from "@node-minify/types";
import { expect, test } from "vitest";
import { minify } from "../packages/core/src/index.ts";
import { filesCSS, filesHTML, filesJS, filesJSON } from "./files-path.ts";

interface TestOptions {
    it: string;
    minify: Partial<Settings>;
}

interface TestConfig {
    options: TestOptions;
    compressorLabel: string;
    compressor: any;
}

type MinifyResult = string;

const runOneTest = async ({
    options,
    compressorLabel,
    compressor,
}: TestConfig): Promise<void> => {
    if (!options) {
        return Promise.resolve();
    }

    const testOptions = createTestOptions(options, compressor);
    const testName = formatTestName(testOptions.it, compressorLabel);

    return test(testName, async () => await executeMinifyTest(testOptions));
};

const createTestOptions = (
    options: TestOptions,
    compressor: any
): TestOptions => {
    const testOptions = structuredClone(options);
    testOptions.minify.compressor = compressor;
    return testOptions;
};

const formatTestName = (
    testString: string,
    compressorLabel: string
): string => {
    return testString.replace("{compressor}", compressorLabel);
};

const executeMinifyTest = async (options: TestOptions): Promise<void> => {
    const normalizedOptions =
        isolatePublicFolderIfTestWouldOverwriteFixtures(options);
    const result = await runMinify(normalizedOptions);

    validateMinifyResult(result);
};

async function runMinify(options: TestOptions): Promise<MinifyResult> {
    return await minify(options.minify as Settings);
}

const validateMinifyResult = (result: MinifyResult): void => {
    expect(result).not.toBeNull();
};

export type Tests = Record<string, { it: string; minify: Partial<Settings> }[]>;

function isolatePublicFolderIfTestWouldOverwriteFixtures(
    options: TestOptions
): TestOptions {
    const publicFolder = options.minify.publicFolder;
    const output = options.minify.output;
    const replaceInPlace = options.minify.replaceInPlace;

    if (typeof publicFolder !== "string") {
        return options;
    }

    // Only isolate when the test is likely to overwrite tracked fixtures
    // (e.g. output is "$1.ext" combined with publicFolder, or replaceInPlace is enabled).
    const isOutputDollarOne =
        typeof output === "string" && output.trimStart().startsWith("$1");
    const isDangerous = Boolean(replaceInPlace) || isOutputDollarOne;
    if (!isDangerous) {
        return options;
    }

    // We only need to isolate for the tracked fixtures folder used by tests.
    const normalizedPublicFolder = path.resolve(publicFolder);
    const normalizedFixturesRoot = path.resolve(__dirname, "fixtures");
    if (!normalizedPublicFolder.startsWith(normalizedFixturesRoot)) {
        return options;
    }

    const isolatedPublicFolder = createIsolatedPublicFolder(publicFolder);

    // Avoid structuredClone() here: at this point `options.minify.compressor` is a function,
    // which causes a DataCloneError under Bun.
    return {
        ...options,
        minify: {
            ...options.minify,
            publicFolder: isolatedPublicFolder,
            // Important for Windows: keep inputs relative when using publicFolder + "$1" outputs.
            // If input is absolute, some output-path logic will embed the drive path into "$1"
            // and then join it under publicFolder, producing invalid paths like:
            //   ...\\es5\\D:\\a\\...\\fixture-1.js
            input: rewriteInputToIsolatedPublicFolder(
                options.minify.input,
                publicFolder
            ),
        },
    };
}

function createIsolatedPublicFolder(originalPublicFolder: string): string {
    const originalResolved = path.resolve(originalPublicFolder);
    const folderName = path.basename(path.normalize(originalResolved));

    const isolatedBase = path.resolve(
        __dirname,
        "tmp",
        "isolated-public-folders",
        crypto.randomUUID()
    );
    const isolatedPublicFolder = path.join(isolatedBase, folderName);

    fs.mkdirSync(isolatedPublicFolder, { recursive: true });
    fs.cpSync(originalResolved, isolatedPublicFolder, {
        recursive: true,
        force: true,
    });

    // Keep the trailing separator for consistency with existing publicFolder values.
    return `${isolatedPublicFolder}${path.sep}`;
}

function rewriteInputToIsolatedPublicFolder(
    input: string | string[] | undefined,
    originalPublicFolder: string
): string | string[] | undefined {
    if (typeof input === "string") {
        return rewriteInputPathToBeRelativeToPublicFolder(
            input,
            originalPublicFolder
        );
    }

    if (Array.isArray(input)) {
        return input.map((item) =>
            rewriteInputPathToBeRelativeToPublicFolder(
                item,
                originalPublicFolder
            )
        );
    }

    return input;
}

function rewriteInputPathToBeRelativeToPublicFolder(
    value: string,
    originalPublicFolder: string
): string {
    // Keep wildcards / already-relative inputs as-is.
    if (!path.isAbsolute(value)) {
        return value;
    }

    const originalResolved = path.resolve(originalPublicFolder);
    const valueResolved = path.resolve(value);

    if (valueResolved.startsWith(originalResolved)) {
        return path.relative(originalResolved, valueResolved);
    }

    return value;
}

const tests: Tests = {
    concat: [
        {
            it: "should concat javascript and no compress and an array of file",
            minify: {
                input: filesJS.filesArray,
                output: filesJS.fileJSOut,
            },
        },
        {
            it: "should concat javascript and no compress and a single file",
            minify: {
                input: filesJS.oneFile,
                output: filesJS.fileJSOut,
            },
        },
        {
            it: "should concat javascript and no compress in memory",
            minify: {
                content: filesJS.contentJS,
            },
        },
    ],
    commoncss: [
        {
            it: "should compress css with {compressor} and a single file",
            minify: {
                input: filesCSS.fileCSS,
                output: filesCSS.fileCSSOut,
                type: "css",
            },
        },
        {
            it: "should compress css with {compressor} and a single file with a custom public folder",
            minify: {
                input: filesCSS.fileCSSWithoutPath,
                output: filesCSS.fileCSSOut,
                type: "css",
                publicFolder: filesCSS.publicFolderCSS,
            },
        },
        {
            it: "should compress css with {compressor} and a single file with a custom public folder and full path",
            minify: {
                input: filesCSS.fileCSS,
                output: filesCSS.fileCSSOut,
                type: "css",
                publicFolder: filesCSS.publicFolderCSS,
            },
        },
        {
            it: "should compress css with {compressor} and a single file with a custom buffer size",
            minify: {
                input: filesCSS.fileCSS,
                output: filesCSS.fileCSSOut,
                type: "css",
                buffer: 2000 * 1024,
            },
        },
        {
            it: "should compress css with {compressor} and a single file with some options",
            minify: {
                input: filesCSS.fileCSS,
                output: filesCSS.fileCSSOut,
                type: "css",
                options: {
                    charset: "utf8",
                },
            },
        },
        {
            it: "should compress css with {compressor} and an array of file",
            minify: {
                input: filesCSS.fileCSSArray,
                output: filesCSS.fileCSSOut,
                type: "css",
            },
        },
        {
            it: "should compress css with {compressor} and an array of file with a custom public folder",
            minify: {
                input: filesCSS.fileCSSArrayWithoutPath,
                output: filesCSS.fileCSSOut,
                type: "css",
                publicFolder: filesCSS.publicFolderCSS,
            },
        },
        {
            it: "should compress css with {compressor} and an array of file with a custom buffer size",
            minify: {
                input: filesCSS.fileCSSArray,
                output: filesCSS.fileCSSOut,
                type: "css",
                buffer: 2000 * 1024,
            },
        },
        {
            it: "should compress css with {compressor} and wildcards path",
            minify: {
                input: filesCSS.fileCSSWithWildcards,
                output: filesCSS.fileCSSOut,
                type: "css",
            },
        },
        {
            it: "should compress css with {compressor} and wildcards path with a custom public folder",
            minify: {
                input: "**/*.css",
                output: filesCSS.fileCSSOut,
                type: "css",
                publicFolder: filesCSS.publicFolderCSS,
            },
        },
        {
            it: "should compress css with {compressor} and wildcards path with a custom buffer size",
            minify: {
                input: filesCSS.fileCSSWithWildcards,
                output: filesCSS.fileCSSOut,
                type: "css",
                buffer: 2000 * 1024,
            },
        },
        {
            it: "should compress css with {compressor} and an array of strings and wildcards path",
            minify: {
                input: filesCSS.fileCSSArrayWithWildcards2,
                output: filesCSS.fileCSSOut,
                type: "css",
            },
        },
        {
            it:
                "should compress css with {compressor} and an array of strings and wildcards path" +
                " with a custom public folder",
            minify: {
                input: filesCSS.fileCSSArrayWithWildcards,
                output: filesCSS.fileCSSOut,
                type: "css",
                publicFolder: filesCSS.publicFolderCSS,
            },
        },
        {
            it: "should compress css with {compressor} in memory",
            minify: {
                type: "css",
                content: filesCSS.contentCSS,
            },
        },
    ],
    commonjs: [
        {
            it: "should compress javascript with {compressor} and a single file",
            minify: {
                input: filesJS.oneFile,
                output: filesJS.fileJSOut,
            },
        },
        {
            it: "should compress javascript with {compressor} and a single file and output $1",
            minify: {
                input: filesJS.oneFile,
                output: filesJS.fileJSOutReplace,
            },
        },
        {
            it: "should compress javascript with {compressor} and a single file and output $1 with a custom public folder",
            minify: {
                input: filesJS.oneFile,
                output: filesJS.fileJSOutReplacePublicFolder,
                publicFolder: filesJS.publicFolderES5,
            },
        },
        {
            it: "should compress javascript with {compressor} and a single file with a custom public folder",
            minify: {
                input: filesJS.oneFileWithoutPath,
                output: filesJS.fileJSOut,
                publicFolder: filesJS.publicFolderES5,
            },
        },
        {
            it: "should compress javascript with {compressor} and a single file with a custom public folder and full path",
            minify: {
                input: filesJS.oneFile,
                output: filesJS.fileJSOut,
                publicFolder: filesJS.publicFolderES5,
            },
        },
        {
            it: "should compress javascript with {compressor} and a single file with a custom buffer size",
            minify: {
                input: filesJS.oneFile,
                output: filesJS.fileJSOut,
                buffer: 2000 * 1024,
            },
        },
        {
            it: "should compress javascript with {compressor} and a single file with empty options",
            minify: {
                input: filesJS.oneFile,
                output: filesJS.fileJSOut,
                options: {},
            },
        },
        {
            it: "should compress javascript with {compressor} and an array of file",
            minify: {
                input: filesJS.filesArray,
                output: filesJS.fileJSOut,
            },
        },
        {
            it: "should compress javascript with {compressor} and an array of file and output $1",
            minify: {
                input: filesJS.filesArray,
                output: filesJS.fileJSOutReplace,
            },
        },
        {
            it: "should compress javascript with {compressor} and an array of file and output $1 with a custom public folder",
            minify: {
                input: filesJS.filesArray,
                output: filesJS.fileJSOutReplacePublicFolder,
                publicFolder: filesJS.publicFolderES5,
            },
        },
        {
            it: "should compress javascript with {compressor} and an array of file with a custom public folder",
            minify: {
                input: filesJS.filesArrayWithoutPath,
                output: filesJS.fileJSOut,
                publicFolder: filesJS.publicFolderES5,
            },
        },
        {
            it: "should compress javascript with {compressor} and an array of file with a custom buffer size",
            minify: {
                input: filesJS.filesArray,
                output: filesJS.fileJSOut,
                buffer: 2000 * 1024,
            },
        },
        {
            it: "should compress javascript with {compressor} and wildcards path",
            minify: {
                input: filesJS.oneFileWithWildcards,
                output: filesJS.fileJSOut,
            },
        },
        {
            it: "should compress javascript with {compressor} and wildcards path with a custom public folder",
            minify: {
                input: "**/*.js",
                output: filesJS.fileJSOut,
                publicFolder: filesJS.publicFolderES5,
            },
        },
        {
            it: "should compress javascript with {compressor} and wildcards path with a custom public folder and replaceInPlace option",
            minify: {
                input: "**/*.js",
                output: filesJS.fileJSOut,
                publicFolder: filesJS.publicFolderES5,
                replaceInPlace: true,
            },
        },
        {
            it: "should compress javascript with {compressor} and wildcards path with a custom buffer size",
            minify: {
                input: filesJS.oneFileWithWildcards,
                output: filesJS.fileJSOut,
                buffer: 2000 * 1024,
            },
        },
        {
            it: "should compress javascript with {compressor} and an array of strings and wildcards path",
            minify: {
                input: filesJS.filesArrayWithWildcards2,
                output: filesJS.fileJSOut,
            },
        },
        {
            it:
                "should compress javascript with {compressor} and an array of strings and wildcards path" +
                " with a custom public folder",
            minify: {
                input: filesJS.filesArrayWithWildcards,
                output: filesJS.fileJSOut,
                publicFolder: filesJS.publicFolderES5,
            },
        },
        {
            it: "should compress javascript with {compressor} in memory",
            minify: {
                content: filesJS.contentJS,
            },
        },
    ],
    babelMinify: [
        {
            it: "should compress javascript with {compressor} and a single file with a babelrc",
            minify: {
                input: filesJS.oneFile,
                output: filesJS.fileJSOut,
                options: {
                    babelrc: filesJS.babelrc,
                },
            },
        },
        {
            it: "should compress javascript with {compressor} and a single file with a preset",
            minify: {
                input: filesJS.oneFile,
                output: filesJS.fileJSOut,
                options: {
                    presets: ["env"],
                },
            },
        },
        {
            it: "should compress javascript with {compressor} and a single file with a babelrc and preset",
            minify: {
                input: filesJS.oneFile,
                output: filesJS.fileJSOut,
                options: {
                    babelrc: filesJS.babelrc,
                    presets: ["env"],
                },
            },
        },
        {
            it: "should compress with {compressor} and some options",
            minify: {
                input: filesJS.oneFileWithWildcards,
                output: filesJS.fileJSOut,
                options: {
                    charset: "utf8",
                },
            },
        },
    ],
    uglifyjs: [
        {
            it: "should create a source map with {compressor}",
            minify: {
                input: filesJS.oneFileWithWildcards,
                output: filesJS.fileJSOut,
                options: {
                    sourceMap: {
                        filename: `${filesJS.fileJSOut}.map`,
                        url: `${filesJS.fileJSOut}.map`,
                    },
                },
            },
        },
        {
            it: "should compress with some options with {compressor}",
            minify: {
                input: filesJS.oneFileWithWildcards,
                output: filesJS.fileJSOut,
                options: {
                    mangle: false,
                },
            },
        },
    ],
    commonhtml: [
        {
            it: "should compress html with {compressor} and a single file",
            minify: {
                input: filesHTML.oneFileHTML,
                output: filesHTML.fileHTMLOut,
            },
        },
        {
            it: "should compress html with {compressor} and a single file with a custom public folder",
            minify: {
                input: filesHTML.oneFileHTMLWithoutPath,
                output: filesHTML.fileHTMLOut,
                publicFolder: filesHTML.publicFolderHTML,
            },
        },
        {
            it: "should compress html with {compressor} and a single file with empty options",
            minify: {
                input: filesHTML.oneFileHTML,
                output: filesHTML.fileHTMLOut,
                options: {},
            },
        },
        {
            it: "should compress html with {compressor} and an array of file",
            minify: {
                input: filesHTML.filesHTMLArray,
                output: filesHTML.fileHTMLOut,
            },
        },
        {
            it: "should compress html with {compressor} and an array of file with a custom public folder",
            minify: {
                input: filesHTML.filesHTMLArrayWithoutPath,
                output: filesHTML.fileHTMLOut,
                publicFolder: filesHTML.publicFolderHTML,
            },
        },
        {
            it: "should compress html with {compressor} and wildcards path",
            minify: {
                input: filesHTML.fileHTMLWithWildcards,
                output: filesHTML.fileHTMLOut,
            },
        },
        {
            it: "should compress html with {compressor} and wildcards path with a custom public folder",
            minify: {
                input: "**/*.html",
                output: filesHTML.fileHTMLOut,
                publicFolder: filesHTML.publicFolderHTML,
            },
        },
        {
            it: "should compress html with {compressor} and an array of strings and wildcards path",
            minify: {
                input: filesHTML.filesHTMLArrayWithWildcards,
                output: filesHTML.fileHTMLOut,
            },
        },
        {
            it:
                "should compress html with {compressor} and an array of strings and wildcards path" +
                " with a custom public folder",
            minify: {
                input: filesHTML.filesHTMLArrayWithWildcards2,
                output: filesHTML.fileHTMLOut,
                publicFolder: filesHTML.publicFolderHTML,
            },
        },
        {
            it: "should compress html with {compressor} and a single file and output $1",
            minify: {
                input: filesHTML.oneFileHTML,
                output: filesHTML.fileHTMLOutReplace,
            },
        },
        {
            it: "should compress html with {compressor} and a single file and output $1 with a custom public folder",
            minify: {
                input: filesHTML.oneFileHTMLWithoutPath,
                output: filesHTML.fileHTMLOutReplacePublicFolder,
                publicFolder: filesHTML.publicFolderHTML,
            },
        },
        {
            it: "should compress html with {compressor} and an array of file and output $1",
            minify: {
                input: filesHTML.filesHTMLArray,
                output: filesHTML.fileHTMLOutReplace,
            },
        },
        {
            it: "should compress html with {compressor} and an array of file and output $1 with a custom public folder",
            minify: {
                input: filesHTML.filesHTMLArrayWithoutPath,
                output: filesHTML.fileHTMLOutReplacePublicFolder,
                publicFolder: filesHTML.publicFolderHTML,
            },
        },
        {
            it: "should compress html with {compressor} in memory",
            minify: {
                content: filesHTML.contentHTML,
            },
        },
    ],
    commonjson: [
        {
            it: "should compress json with {compressor} and a single file",
            minify: {
                input: filesJSON.oneFileJSON,
                output: filesJSON.fileJSONOut,
            },
        },
        {
            it: "should compress json with {compressor} and a single file with a custom public folder",
            minify: {
                input: filesJSON.oneFileJSONWithoutPath,
                output: filesJSON.fileJSONOut,
                publicFolder: filesJSON.publicFolderJSON,
            },
        },
        {
            it: "should compress json with {compressor} and a single file with empty options",
            minify: {
                input: filesJSON.oneFileJSON,
                output: filesJSON.fileJSONOut,
                options: {},
            },
        },
        {
            it: "should compress json with {compressor} and an array of file",
            minify: {
                input: filesJSON.filesJSONArray,
                output: filesJSON.fileJSONOut,
            },
        },
        {
            it: "should compress json with {compressor} and an array of file with a custom public folder",
            minify: {
                input: filesJSON.filesJSONArrayWithoutPath,
                output: filesJSON.fileJSONOut,
                publicFolder: filesJSON.publicFolderJSON,
            },
        },
        {
            it: "should compress json with {compressor} and wildcards path",
            minify: {
                input: filesJSON.fileJSONWithWildcards,
                output: filesJSON.fileJSONOut,
            },
        },
        {
            it: "should compress json with {compressor} and wildcards path with a custom public folder",
            minify: {
                input: "**/*.json",
                output: filesJSON.fileJSONOut,
                publicFolder: filesJSON.publicFolderJSON,
            },
        },
        {
            it: "should compress json with {compressor} and an array of strings and wildcards path",
            minify: {
                input: filesJSON.filesJSONArrayWithWildcards,
                output: filesJSON.fileJSONOut,
            },
        },
        {
            it:
                "should compress json with {compressor} and an array of strings and wildcards path" +
                " with a custom public folder",
            minify: {
                input: filesJSON.filesJSONArrayWithWildcards2,
                output: filesJSON.fileJSONOut,
                publicFolder: filesJSON.publicFolderJSON,
            },
        },
        {
            it: "should compress json with {compressor} and a single file and output $1",
            minify: {
                input: filesJSON.oneFileJSON,
                output: filesJSON.fileJSONOutReplace,
            },
        },
        {
            it: "should compress json with {compressor} and a single file and output $1 with a custom public folder",
            minify: {
                input: filesJSON.oneFileJSONWithoutPath,
                output: filesJSON.fileJSONOutReplacePublicFolder,
                publicFolder: filesJSON.publicFolderJSON,
            },
        },
        {
            it: "should compress json with {compressor} and an array of file and output $1",
            minify: {
                input: filesJSON.filesJSONArray,
                output: filesJSON.fileJSONOutReplace,
            },
        },
        {
            it: "should compress json with {compressor} and an array of file and output $1 with a custom public folder",
            minify: {
                input: filesJSON.filesJSONArrayWithoutPath,
                output: filesJSON.fileJSONOutReplacePublicFolder,
                publicFolder: filesJSON.publicFolderJSON,
            },
        },
        {
            it: "should compress json with {compressor} in memory",
            minify: {
                content: filesJSON.contentJSON,
            },
        },
    ],
};

export { runOneTest, tests };

/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import childProcess from "node:child_process";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { filesCSS, filesJS, filesJSON } from "../../../tests/files-path.ts";
import { compress } from "../src/compress.ts";
import type { SettingsWithCompressor } from "../src/index.ts";
import * as cli from "../src/index.ts";

describe("Package: cli", () => {
    test("should minify to have been called with gcc", async () => {
        const spy = vi.spyOn(cli, "run");
        await cli.run({
            compressor: "google-closure-compiler",
            input: filesJS.oneFile,
            output: filesJS.fileJSOut,
            option: '{"createSourceMap": true}',
        });
        return expect(spy).toHaveBeenCalled();
    }, 60000); // GCC can take ~30s
});

describe("JavaScript compressors", () => {
    test.each([
        ["terser"],
        ["uglify-js"],
        ["swc"],
        ["oxc"],
    ] as const)("should minify with %s", async (compressor) => {
        const spy = vi.spyOn(cli, "run");
        await cli.run({
            compressor,
            input: filesJS.oneFile,
            output: filesJS.fileJSOut,
            silence: true,
        });
        expect(spy).toHaveBeenCalled();
    });

    test("should minify with esbuild (requires type)", async () => {
        const spy = vi.spyOn(cli, "run");
        await cli.run({
            compressor: "esbuild",
            input: filesJS.oneFile,
            output: filesJS.fileJSOut,
            type: "js",
            silence: true,
        });
        expect(spy).toHaveBeenCalled();
    });
});

describe("CSS compressors", () => {
    test.each([
        ["clean-css"],
        ["cssnano"],
        ["csso"],
    ] as const)("should minify with %s", async (compressor) => {
        const spy = vi.spyOn(cli, "run");
        await cli.run({
            compressor,
            input: filesCSS.fileCSS,
            output: filesCSS.fileCSSOut,
            silence: true,
        });
        expect(spy).toHaveBeenCalled();
    });

    test("should minify with lightningcss (requires type)", async () => {
        const spy = vi.spyOn(cli, "run");
        await cli.run({
            compressor: "lightningcss",
            input: filesCSS.fileCSS,
            output: filesCSS.fileCSSOut,
            type: "css",
            silence: true,
        });
        expect(spy).toHaveBeenCalled();
    });
});

describe("JSON compressors", () => {
    test("should minify with jsonminify", async () => {
        const spy = vi.spyOn(cli, "run");
        await cli.run({
            compressor: "jsonminify",
            input: filesJSON.oneFileJSON,
            output: filesJSON.fileJSONOut,
            silence: true,
        });
        expect(spy).toHaveBeenCalled();
    });
});

describe("cli error", () => {
    beforeAll(() => {
        const spy = vi.spyOn(childProcess, "spawn");
        spy.mockImplementation(() => {
            throw new Error();
        });
    });
    test("should minify to throw with yui error", async () => {
        const spy = vi.spyOn(cli, "run");
        const settings: SettingsWithCompressor = {
            compressor: "yui",
            input: filesJS.oneFile,
            output: filesJS.fileJSOut,
        };
        await expect(cli.run(settings)).rejects.toThrow();
        try {
            return await cli.run(settings);
        } catch {
            return expect(spy).toHaveBeenCalled();
        }
    });
    afterAll(() => {
        vi.restoreAllMocks();
    });
});

describe("CLI Coverage", () => {
    describe("run dynamic import", () => {
        test("should throw if compressor not found", async () => {
            const settings = {
                compressor: "invalid-compressor" as any,
                input: "foo.js",
                output: "bar.js",
                silence: true,
            };
            await expect(cli.run(settings)).rejects.toThrow(
                "Compressor 'invalid-compressor' not found."
            );
        });

        test("should throw if implementation is invalid", async () => {
            vi.doMock("@node-minify/no-compress", () => ({
                noCompress: "not-a-function",
            }));
            try {
                const settings = {
                    compressor: "no-compress" as any,
                    input: "foo.js",
                    output: "bar.js",
                    silence: true,
                };
                await expect(cli.run(settings)).rejects.toThrow(
                    "Invalid compressor implementation for 'no-compress'."
                );
            } finally {
                vi.doUnmock("@node-minify/no-compress");
            }
        });

        test("should throw if cssOnly compressor receives non-css type", async () => {
            const settings = {
                compressor: "lightningcss" as const,
                input: filesCSS.fileCSS,
                output: filesCSS.fileCSSOut,
                type: "js" as const,
                silence: true,
            };
            await expect(cli.run(settings)).rejects.toThrow(
                "lightningcss only supports type 'css'"
            );
        });
    });

    describe("compress default results", () => {
        test("should return default result if output is an array", async () => {
            const settings = {
                compressor: () => ({ code: "minified" }),
                content: "foo",
                output: ["bar.js"],
            };
            const result = await compress(settings as any);
            expect(result.size).toBe("0");
        });

        test("should return default result if output contains $1", async () => {
            const settings = {
                compressor: () => ({ code: "minified" }),
                content: "foo",
                output: "$1.min.js",
            };
            const result = await compress(settings as any);
            expect(result.size).toBe("0");
        });

        test("should throw if minify fails", async () => {
            const settings = {
                compressor: () => {
                    throw new Error("Minify failed");
                },
                content: "foo",
                output: "bar.js",
            };
            await expect(compress(settings as any)).rejects.toThrow(
                "Compression failed: Minify failed"
            );
        });
    });
});

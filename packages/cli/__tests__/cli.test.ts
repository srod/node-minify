/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import childProcess from "node:child_process";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { filesJS } from "../../../tests/files-path.ts";
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
    });
});

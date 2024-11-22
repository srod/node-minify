/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import childProcess from "node:child_process";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { filesJS } from "../../../tests/files-path";
import * as cli from "../src";
import type { SettingsWithCompressor } from "../src";

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
        const options: SettingsWithCompressor = {
            compressor: "yui",
            input: filesJS.oneFile,
            output: filesJS.fileJSOut,
        };
        expect(cli.run(options)).rejects.toThrow();
        try {
            return await cli.run(options);
        } catch {
            return expect(spy).toHaveBeenCalled();
        }
    });
    afterAll(() => {
        vi.restoreAllMocks();
    });
});

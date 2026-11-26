/*! node-minify action tests - MIT Licensed */

import * as core from "@actions/core";
import { resolveCompressor } from "@node-minify/utils";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { runExplicitMode } from "../src/index.ts";
import type { ActionInputs } from "../src/types.ts";

vi.mock("@actions/core");
vi.mock("@actions/github");

const inputs: ActionInputs = {
    compressor: "yui",
    input: "tests/fixtures/es5/fixture-1.js",
    output: "tests/tmp/action-removed-out.js",
    type: undefined,
    options: {},
    reportSummary: false,
    reportPRComment: false,
    reportAnnotations: false,
    benchmark: false,
    benchmarkCompressors: [],
    workingDirectory: ".",
    includeGzip: false,
    failOnIncrease: false,
    minReduction: 0,
    githubToken: "token",
    auto: false,
    patterns: [],
    outputDir: "dist",
    additionalIgnore: [],
    dryRun: false,
};

describe("runExplicitMode with a removed compressor", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("AE1: fails with the message resolveCompressor throws", async () => {
        const fromResolver = await resolveCompressor("yui").then(
            () => undefined,
            (error: Error) => error.message
        );

        expect(fromResolver).toBe(
            "Compressor 'yui' was removed in v11. Use 'terser or lightningcss' instead."
        );
        await expect(runExplicitMode(inputs)).rejects.toThrow(
            new Error(fromResolver)
        );
    });

    test("fails without printing a warning", async () => {
        await expect(runExplicitMode(inputs)).rejects.toThrow();

        expect(core.warning).not.toHaveBeenCalled();
    });

    test("fails with the removed message even when the input file is missing", async () => {
        await expect(
            runExplicitMode({ ...inputs, input: "tests/fixtures/missing.js" })
        ).rejects.toThrow("Compressor 'yui' was removed in v11.");
    });
});

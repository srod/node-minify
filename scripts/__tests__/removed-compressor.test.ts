/*! node-minify - MIT Licensed */

import { resolveCompressor } from "@node-minify/utils";
import { describe, expect, test, vi } from "vitest";
import { runExplicitMode } from "../../packages/action/src/index.ts";
import type { ActionInputs } from "../../packages/action/src/types.ts";
import { run as runCli } from "../../packages/cli/src/index.ts";

vi.mock("@actions/core");
vi.mock("@actions/github");

const fixture = "tests/fixtures/es5/fixture-1.js";

const actionInputs: ActionInputs = {
    compressor: "yui",
    input: fixture,
    output: "tests/tmp/removed-compressor-out.js",
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

async function messageOf(promise: Promise<unknown>): Promise<string> {
    try {
        await promise;
    } catch (error) {
        if (error instanceof Error) return error.message;
    }
    throw new Error("expected the promise to reject with an Error");
}

describe("removed compressors fail the same way everywhere", () => {
    test.each([["yui"], ["@node-minify/yui"]])(
        "AE1: CLI, Action explicit mode and resolveCompressor reject '%s' with one message",
        async (name) => {
            const fromResolver = await messageOf(resolveCompressor(name));
            const fromAction = await messageOf(
                runExplicitMode({ ...actionInputs, compressor: name })
            );
            const fromCli = await messageOf(
                runCli({
                    compressor: name,
                    input: fixture,
                    output: "tests/tmp/removed-compressor-out.js",
                    silence: true,
                })
            );

            expect(fromResolver).toBe(
                `Compressor '${name}' was removed in v11. Use 'terser or lightningcss' instead.`
            );
            expect(fromAction).toBe(fromResolver);
            expect(fromCli).toBe(`Compression failed: ${fromResolver}`);
        }
    );
});

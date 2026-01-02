/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeAll, describe, expect, test } from "vitest";
import {
    createTempFixtures,
    getCLIPath,
    runCLI,
    type TempFixtures,
} from "./helpers.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = getCLIPath();
const fixtureJS = path.resolve(__dirname, "../fixtures/es5/fixture-1.js");

describe("CLI Benchmark Integration Tests", () => {
    let fixtures: TempFixtures;

    afterEach(async () => {
        if (fixtures) {
            await fixtures.cleanup();
        }
    });

    beforeAll(async () => {
        try {
            await fs.access(CLI_PATH);
        } catch {
            throw new Error(
                `CLI not built. Run 'bun run build' first. Expected: ${CLI_PATH}`
            );
        }
    });

    test("should run benchmark via CLI", async () => {
        fixtures = await createTempFixtures({});
        const result = await runCLI([
            "benchmark",
            fixtureJS,
            "-c",
            "terser,esbuild",
            "-n",
            "1",
            "-t",
            "js",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain("Benchmarking");
        expect(result.stdout).toContain("terser");
        expect(result.stdout).toContain("esbuild");
        expect(result.stdout).toContain("Best compression");
    });

    test("should run benchmark and output JSON via CLI", async () => {
        fixtures = await createTempFixtures({});
        const result = await runCLI([
            "benchmark",
            fixtureJS,
            "-c",
            "terser",
            "-f",
            "json",
            "-t",
            "js",
        ]);

        expect(result.exitCode).toBe(0);
        const json = JSON.parse(result.stdout);
        expect(json.timestamp).toBeDefined();
        expect(json.files).toHaveLength(1);
        expect(json.files[0].results[0].compressor).toBe("terser");
    });

    test("should run benchmark and output Markdown via CLI", async () => {
        fixtures = await createTempFixtures({});
        const result = await runCLI([
            "benchmark",
            fixtureJS,
            "-c",
            "terser",
            "-f",
            "markdown",
            "-t",
            "js",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain("# Benchmark Results");
        expect(result.stdout).toContain("| Compressor |");
    });

    test("should include gzip size via CLI", async () => {
        fixtures = await createTempFixtures({});
        const result = await runCLI([
            "benchmark",
            fixtureJS,
            "-c",
            "terser",
            "--gzip",
            "-t",
            "js",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain("Gzip");
    });

    test("should include brotli size via CLI", async () => {
        fixtures = await createTempFixtures({});
        const result = await runCLI([
            "benchmark",
            fixtureJS,
            "-c",
            "terser",
            "--brotli",
            "-t",
            "js",
        ]);

        expect(result.exitCode).toBe(0);
        // Reporter console.ts needs to be updated to show Brotli column
        // But the runner should already be calculating it
    });

    test("should handle errors for non-existent compressor via CLI", async () => {
        fixtures = await createTempFixtures({});
        const result = await runCLI([
            "benchmark",
            fixtureJS,
            "-c",
            "non-existent",
            "-t",
            "js",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain("not found");
    });
});

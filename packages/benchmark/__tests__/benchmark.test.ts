/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, test, vi } from "vitest";
import { benchmark } from "../src/index.ts";
import { getReporter } from "../src/reporters/index.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input = path.resolve(
    __dirname,
    "../../../tests/fixtures/es5/fixture-1.js"
);

describe("Package: benchmark", () => {
    test("should benchmark multiple compressors", async () => {
        const results = await benchmark({
            input,
            compressors: ["terser", "esbuild"],
            iterations: 2,
            warmup: 1,
        });

        expect(results).toBeDefined();
        expect(results.files).toHaveLength(1);
        const firstFile = results.files[0];
        expect(firstFile).toBeDefined();
        expect(firstFile?.results).toHaveLength(2);
        expect(firstFile?.results[0]?.success).toBe(true);
        expect(results.summary).toBeDefined();
    });

    test("should handle missing compressors gracefully", async () => {
        const results = await benchmark({
            input,
            compressors: ["non-existent"],
        });

        const firstFile = results.files[0];
        const firstResult = firstFile?.results[0];
        expect(firstResult?.success).toBe(false);
        expect(firstResult?.error).toContain("not found");
    });

    test("writes markdown report when format is markdown and output is set", async () => {
        const tempDir = await mkdtemp(
            path.join(os.tmpdir(), "node-minify-bench-out-")
        );
        const outputPath = path.join(tempDir, "BENCHMARK.md");

        try {
            await benchmark({
                input,
                compressors: ["terser"],
                format: "markdown",
                output: outputPath,
            });

            const content = await readFile(outputPath, "utf-8");
            expect(content).toContain("# Benchmark Results");
            expect(content).toContain("| terser |");
        } finally {
            await rm(tempDir, { recursive: true, force: true });
        }
    });

    test("writes valid JSON report when format is json and output is set", async () => {
        const tempDir = await mkdtemp(
            path.join(os.tmpdir(), "node-minify-bench-out-")
        );
        const outputPath = path.join(tempDir, "results.json");

        try {
            await benchmark({
                input,
                compressors: ["terser"],
                format: "json",
                output: outputPath,
            });

            const content = await readFile(outputPath, "utf-8");
            const parsed = JSON.parse(content) as {
                files: unknown[];
                summary: Record<string, string>;
            };
            expect(parsed.files).toHaveLength(1);
            expect(parsed.summary).toBeDefined();
        } finally {
            await rm(tempDir, { recursive: true, force: true });
        }
    });

    describe("with terminal colors enabled", () => {
        afterEach(() => {
            vi.unstubAllEnvs();
        });

        test("creates missing parent folders and strips ANSI colors for default console format", async () => {
            vi.stubEnv("FORCE_COLOR", "1");
            const tempDir = await mkdtemp(
                path.join(os.tmpdir(), "node-minify-bench-out-")
            );
            const outputPath = path.join(
                tempDir,
                "reports",
                "nested",
                "bench.txt"
            );

            try {
                const results = await benchmark({
                    input,
                    compressors: ["terser"],
                    output: outputPath,
                });

                expect(getReporter()(results)).toContain("\u001b[");
                const content = await readFile(outputPath, "utf-8");
                expect(content).toContain("terser");
                expect(content).not.toContain("\u001b[");
            } finally {
                await rm(tempDir, { recursive: true, force: true });
            }
        });

        test("strips ANSI colors for an unknown format that falls back to the console reporter", async () => {
            vi.stubEnv("FORCE_COLOR", "1");
            const tempDir = await mkdtemp(
                path.join(os.tmpdir(), "node-minify-bench-out-")
            );
            const outputPath = path.join(tempDir, "bench.txt");

            try {
                const results = await benchmark({
                    input,
                    compressors: ["terser"],
                    // @ts-expect-error testing invalid input: the CLI passes any -f value through
                    format: "txt",
                    output: outputPath,
                });

                expect(getReporter("txt")(results)).toContain("\u001b[");
                const content = await readFile(outputPath, "utf-8");
                expect(content).toContain("terser");
                expect(content).not.toContain("\u001b[");
            } finally {
                await rm(tempDir, { recursive: true, force: true });
            }
        });
    });

    test("rejects when output points to an existing directory", async () => {
        const tempDir = await mkdtemp(
            path.join(os.tmpdir(), "node-minify-bench-dir-")
        );

        try {
            await expect(
                benchmark({
                    input,
                    compressors: ["terser"],
                    output: tempDir,
                })
            ).rejects.toThrow();
        } finally {
            await rm(tempDir, { recursive: true, force: true });
        }
    });
});

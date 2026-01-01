/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeAll, describe, expect, test } from "vitest";
import {
    createTempFixtures,
    getCLIPath,
    readTempFile,
    runCLI,
    sampleCSS,
    sampleJS,
    sampleJSON,
    type TempFixtures,
    tempFileExists,
} from "./helpers.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLI_PATH = getCLIPath();

describe("CLI Integration Tests", () => {
    let fixtures: TempFixtures;

    afterEach(async () => {
        if (fixtures) {
            await fixtures.cleanup();
        }
    });

    beforeAll(async () => {
        const fs = await import("node:fs/promises");
        try {
            await fs.access(CLI_PATH);
        } catch {
            throw new Error(
                `CLI not built. Run 'bun run build' first. Expected: ${CLI_PATH}`
            );
        }
    });

    describe("Basic JS minification", () => {
        test("should minify JS file with terser", async () => {
            fixtures = await createTempFixtures({
                "input.js": sampleJS,
            });

            const result = await runCLI([
                "-c",
                "terser",
                "-i",
                path.join(fixtures.dir, "input.js"),
                "-o",
                path.join(fixtures.dir, "output.js"),
                "-s",
            ]);

            expect(result.exitCode).toBe(0);
            expect(await tempFileExists(fixtures, "output.js")).toBe(true);

            const output = await readTempFile(fixtures, "output.js");
            expect(output.length).toBeLessThan(sampleJS.length);
            expect(output).not.toContain("// This is a comment");
        });

        test("should minify JS file with uglify-js", async () => {
            fixtures = await createTempFixtures({
                "input.js": sampleJS,
            });

            const result = await runCLI([
                "-c",
                "uglify-js",
                "-i",
                path.join(fixtures.dir, "input.js"),
                "-o",
                path.join(fixtures.dir, "output.js"),
                "-s",
            ]);

            expect(result.exitCode).toBe(0);
            expect(await tempFileExists(fixtures, "output.js")).toBe(true);
        });

        test("should minify JS file with swc", async () => {
            fixtures = await createTempFixtures({
                "input.js": sampleJS,
            });

            const result = await runCLI([
                "-c",
                "swc",
                "-i",
                path.join(fixtures.dir, "input.js"),
                "-o",
                path.join(fixtures.dir, "output.js"),
                "-s",
            ]);

            expect(result.exitCode).toBe(0);
            expect(await tempFileExists(fixtures, "output.js")).toBe(true);
        });

        test("should minify JS file with esbuild (requires type)", async () => {
            fixtures = await createTempFixtures({
                "input.js": sampleJS,
            });

            const result = await runCLI([
                "-c",
                "esbuild",
                "-i",
                path.join(fixtures.dir, "input.js"),
                "-o",
                path.join(fixtures.dir, "output.js"),
                "-t",
                "js",
                "-s",
            ]);

            expect(result.exitCode).toBe(0);
            expect(await tempFileExists(fixtures, "output.js")).toBe(true);
        });
    });

    describe("Basic CSS minification", () => {
        test("should minify CSS file with clean-css", async () => {
            fixtures = await createTempFixtures({
                "input.css": sampleCSS,
            });

            const result = await runCLI([
                "-c",
                "clean-css",
                "-i",
                path.join(fixtures.dir, "input.css"),
                "-o",
                path.join(fixtures.dir, "output.css"),
                "-s",
            ]);

            expect(result.exitCode).toBe(0);
            expect(await tempFileExists(fixtures, "output.css")).toBe(true);

            const output = await readTempFile(fixtures, "output.css");
            expect(output.length).toBeLessThan(sampleCSS.length);
            expect(output).not.toContain("/* This is a comment");
        });

        test("should minify CSS file with cssnano", async () => {
            fixtures = await createTempFixtures({
                "input.css": sampleCSS,
            });

            const result = await runCLI([
                "-c",
                "cssnano",
                "-i",
                path.join(fixtures.dir, "input.css"),
                "-o",
                path.join(fixtures.dir, "output.css"),
                "-s",
            ]);

            expect(result.exitCode).toBe(0);
            expect(await tempFileExists(fixtures, "output.css")).toBe(true);
        });

        test("should minify CSS file with lightningcss (requires type)", async () => {
            fixtures = await createTempFixtures({
                "input.css": sampleCSS,
            });

            const result = await runCLI([
                "-c",
                "lightningcss",
                "-i",
                path.join(fixtures.dir, "input.css"),
                "-o",
                path.join(fixtures.dir, "output.css"),
                "-t",
                "css",
                "-s",
            ]);

            expect(result.exitCode).toBe(0);
            expect(await tempFileExists(fixtures, "output.css")).toBe(true);
        });
    });

    describe("JSON minification", () => {
        test("should minify JSON file with jsonminify", async () => {
            fixtures = await createTempFixtures({
                "input.json": sampleJSON,
            });

            const result = await runCLI([
                "-c",
                "jsonminify",
                "-i",
                path.join(fixtures.dir, "input.json"),
                "-o",
                path.join(fixtures.dir, "output.json"),
                "-s",
            ]);

            expect(result.exitCode).toBe(0);
            expect(await tempFileExists(fixtures, "output.json")).toBe(true);

            const output = await readTempFile(fixtures, "output.json");
            expect(output).not.toContain("\n");
            expect(JSON.parse(output)).toEqual(JSON.parse(sampleJSON));
        });
    });

    describe("CLI flags", () => {
        test("should display version with --version", async () => {
            const result = await runCLI(["--version"]);

            expect(result.exitCode).toBe(0);
            expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
        });

        test("should display version with -v", async () => {
            const result = await runCLI(["-v"]);

            expect(result.exitCode).toBe(0);
            expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
        });

        test("should display help with --help", async () => {
            const result = await runCLI(["--help"]);

            expect(result.exitCode).toBe(0);
            expect(result.stdout).toContain("--compressor");
            expect(result.stdout).toContain("--input");
            expect(result.stdout).toContain("--output");
            expect(result.stdout).toContain("List of compressors");
        });

        test("should suppress output with --silence", async () => {
            fixtures = await createTempFixtures({
                "input.js": sampleJS,
            });

            const result = await runCLI([
                "-c",
                "terser",
                "-i",
                path.join(fixtures.dir, "input.js"),
                "-o",
                path.join(fixtures.dir, "output.js"),
                "--silence",
            ]);

            expect(result.exitCode).toBe(0);
            expect(result.stdout).toBe("");
        });
    });

    describe("CLI error handling", () => {
        test("should exit with error for invalid compressor", async () => {
            fixtures = await createTempFixtures({
                "input.js": sampleJS,
            });

            const result = await runCLI([
                "-c",
                "invalid-compressor",
                "-i",
                path.join(fixtures.dir, "input.js"),
                "-o",
                path.join(fixtures.dir, "output.js"),
                "-s",
            ]);

            expect(result.exitCode).not.toBe(0);
            expect(result.stderr).toContain("not found");
        });

        test("should exit with error for missing input file", async () => {
            fixtures = await createTempFixtures({});

            const result = await runCLI([
                "-c",
                "terser",
                "-i",
                path.join(fixtures.dir, "nonexistent.js"),
                "-o",
                path.join(fixtures.dir, "output.js"),
                "-s",
            ]);

            expect(result.exitCode).not.toBe(0);
        });

        test("should show help when required options missing", async () => {
            const result = await runCLI(["-c", "terser"]);

            expect(result.stdout).toContain("--input");
            expect(result.stdout).toContain("--output");
        });

        test("should error when CSS-only compressor used with JS type", async () => {
            fixtures = await createTempFixtures({
                "input.css": sampleCSS,
            });

            const result = await runCLI([
                "-c",
                "lightningcss",
                "-i",
                path.join(fixtures.dir, "input.css"),
                "-o",
                path.join(fixtures.dir, "output.css"),
                "-t",
                "js",
                "-s",
            ]);

            expect(result.exitCode).not.toBe(0);
            expect(result.stderr).toContain("only supports type 'css'");
        });
    });

    describe("CLI with options", () => {
        // Skip on Windows: shell quoting for JSON differs between platforms
        test.skipIf(process.platform === "win32")(
            "should pass compressor options as JSON",
            async () => {
                fixtures = await createTempFixtures({
                    "input.js": sampleJS,
                });

                const result = await runCLI([
                    "-c",
                    "terser",
                    "-i",
                    path.join(fixtures.dir, "input.js"),
                    "-o",
                    path.join(fixtures.dir, "output.js"),
                    "-O",
                    '{"mangle":false}',
                    "-s",
                ]);

                expect(result.exitCode).toBe(0);
                expect(await tempFileExists(fixtures, "output.js")).toBe(true);
            }
        );
    });

    describe("Multiple input files", () => {
        test("should handle comma-separated input files", async () => {
            fixtures = await createTempFixtures({
                "a.js": "var a = 1;",
                "b.js": "var b = 2;",
            });

            const result = await runCLI([
                "-c",
                "terser",
                "-i",
                `${path.join(fixtures.dir, "a.js")},${path.join(fixtures.dir, "b.js")}`,
                "-o",
                path.join(fixtures.dir, "output.js"),
                "-s",
            ]);

            expect(result.exitCode).toBe(0);
            expect(await tempFileExists(fixtures, "output.js")).toBe(true);

            const output = await readTempFile(fixtures, "output.js");
            expect(output).toContain("a");
            expect(output).toContain("b");
        });
    });
});

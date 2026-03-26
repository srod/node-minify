/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { runDoctor } from "../src/doctor.ts";

/**
 * Create an isolated temp directory for each test.
 */
function createTmpDir(): string {
    return mkdtempSync(join(tmpdir(), "node-minify-doctor-"));
}

/**
 * Helper: write a package.json with given dependencies.
 *
 * @param dir - Directory to write package.json in
 * @param deps - Dependencies object
 * @param devDeps - Dev dependencies object
 */
function writePackageJson(
    dir: string,
    deps: Record<string, string> = {},
    devDeps: Record<string, string> = {}
): void {
    const pkg = {
        name: "test-project",
        version: "1.0.0",
        ...(Object.keys(deps).length > 0 ? { dependencies: deps } : {}),
        ...(Object.keys(devDeps).length > 0
            ? { devDependencies: devDeps }
            : {}),
    };
    writeFileSync(join(dir, "package.json"), JSON.stringify(pkg, null, 2));
}

/**
 * Helper: write a source file with given content.
 *
 * @param dir - Base directory
 * @param relPath - Relative file path (directories created automatically)
 * @param content - File content
 */
function writeSourceFile(dir: string, relPath: string, content: string): void {
    const fullPath = join(dir, relPath);
    const parentDir = join(fullPath, "..");
    mkdirSync(parentDir, { recursive: true });
    writeFileSync(fullPath, content);
}

/**
 * Helper: write a workflow YAML file.
 *
 * @param dir - Base directory
 * @param fileName - Workflow file name (e.g. "ci.yml")
 * @param content - YAML content
 */
function writeWorkflowFile(
    dir: string,
    fileName: string,
    content: string
): void {
    const workflowDir = join(dir, ".github", "workflows");
    mkdirSync(workflowDir, { recursive: true });
    writeFileSync(join(workflowDir, fileName), content);
}

/**
 * Capture all console.log output during a function call.
 *
 * @param fn - Async function to execute while capturing output
 * @returns Object with the function's return value and captured output lines
 */
async function captureOutput<T>(
    fn: () => Promise<T>
): Promise<{ result: T; output: string }> {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
        const result = await fn();
        const output = logSpy.mock.calls
            .map((call) => call.join(" "))
            .join("\n");
        return { result, output };
    } finally {
        logSpy.mockRestore();
    }
}

describe("Package: doctor", () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = createTmpDir();
    });

    afterEach(() => {
        rmSync(tmpDir, { recursive: true, force: true });
    });

    describe("clean project", () => {
        test("should return 0 with no output for clean project", async () => {
            writePackageJson(tmpDir, {
                "@node-minify/core": "^11.0.0",
                "@node-minify/terser": "^11.0.0",
            });

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(0);
            expect(output).toBe("");
        });

        test("should return 0 for empty directory", async () => {
            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(0);
            expect(output).toBe("");
        });
    });

    describe("package.json scanner", () => {
        test("should detect removed dep in dependencies", async () => {
            writePackageJson(tmpDir, {
                "@node-minify/babel-minify": "^10.0.0",
            });

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(1);
            expect(output).toContain("ERROR");
            expect(output).toContain("@node-minify/babel-minify");
            expect(output).toContain("removed");
            expect(output).toContain("terser");
        });

        test("should detect removed dep in devDependencies", async () => {
            writePackageJson(
                tmpDir,
                {},
                {
                    "@node-minify/uglify-es": "^10.0.0",
                }
            );

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(1);
            expect(output).toContain("@node-minify/uglify-es");
            expect(output).toContain("terser");
        });

        test("should detect multiple removed deps", async () => {
            writePackageJson(tmpDir, {
                "@node-minify/babel-minify": "^10.0.0",
                "@node-minify/sqwish": "^10.0.0",
                "@node-minify/crass": "^10.0.0",
            });

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(1);
            expect(output).toContain("@node-minify/babel-minify");
            expect(output).toContain("@node-minify/sqwish");
            expect(output).toContain("@node-minify/crass");
        });

        test("should detect removed dep in monorepo packages/*/package.json", async () => {
            writePackageJson(tmpDir); // root with no deps
            const subPkgDir = join(tmpDir, "packages", "my-app");
            mkdirSync(subPkgDir, { recursive: true });
            writePackageJson(subPkgDir, {
                "@node-minify/yui": "^10.0.0",
            });

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(1);
            expect(output).toContain("@node-minify/yui");
            expect(output).toContain("packages");
        });
    });

    describe("source import scanner", () => {
        test("should detect removed package in ES import", async () => {
            writePackageJson(tmpDir);
            writeSourceFile(
                tmpDir,
                "src/app.ts",
                'import { babelMinify } from "@node-minify/babel-minify";\n\nconsole.log(babelMinify);\n'
            );

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(1);
            expect(output).toContain("src/app.ts");
            expect(output).toContain("@node-minify/babel-minify");
            expect(output).toContain(":1");
        });

        test("should detect removed package in require()", async () => {
            writePackageJson(tmpDir);
            writeSourceFile(
                tmpDir,
                "lib/index.js",
                'const sqwish = require("@node-minify/sqwish");\n'
            );

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(1);
            expect(output).toContain("lib/index.js");
            expect(output).toContain("@node-minify/sqwish");
        });

        test("should detect legacy package in imports", async () => {
            writePackageJson(tmpDir);
            writeSourceFile(
                tmpDir,
                "src/config.ts",
                'import { jsonminify } from "@node-minify/jsonminify";\n'
            );

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(0);
            expect(output).toContain("WARNING");
            expect(output).toContain("@node-minify/jsonminify");
            expect(output).toContain("legacy");
        });

        test("should skip files in node_modules", async () => {
            writePackageJson(tmpDir);
            writeSourceFile(
                tmpDir,
                "node_modules/some-pkg/index.js",
                'const babel = require("@node-minify/babel-minify");\n'
            );

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(0);
            expect(output).toBe("");
        });

        test("should skip files in dist", async () => {
            writePackageJson(tmpDir);
            writeSourceFile(
                tmpDir,
                "dist/bundle.js",
                'import { crass } from "@node-minify/crass";\n'
            );

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(0);
            expect(output).toBe("");
        });
    });

    describe("workflow YAML scanner", () => {
        test("should detect removed compressor in workflow", async () => {
            writePackageJson(tmpDir);
            writeWorkflowFile(
                tmpDir,
                "ci.yml",
                [
                    "name: CI",
                    "on: push",
                    "jobs:",
                    "  minify:",
                    "    runs-on: ubuntu-latest",
                    "    steps:",
                    "      - uses: srod/node-minify@v1",
                    "        with:",
                    "          compressor: babel-minify",
                    '          input: "src/app.js"',
                ].join("\n")
            );

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(1);
            expect(output).toContain("babel-minify");
            expect(output).toContain(".github/workflows/ci.yml");
        });

        test("should detect quoted compressor name", async () => {
            writePackageJson(tmpDir);
            writeWorkflowFile(
                tmpDir,
                "build.yaml",
                [
                    "name: Build",
                    "on: push",
                    "jobs:",
                    "  minify:",
                    "    steps:",
                    "      - with:",
                    '          compressor: "sqwish"',
                ].join("\n")
            );

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(1);
            expect(output).toContain("sqwish");
        });

        test("should not flag valid compressor in workflow", async () => {
            writePackageJson(tmpDir);
            writeWorkflowFile(
                tmpDir,
                "ci.yml",
                [
                    "name: CI",
                    "on: push",
                    "jobs:",
                    "  minify:",
                    "    steps:",
                    "      - with:",
                    "          compressor: terser",
                ].join("\n")
            );

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(0);
            expect(output).toBe("");
        });
    });

    describe("compressor assignment scanner", () => {
        test("should detect removed compressor in string assignment", async () => {
            writePackageJson(tmpDir);
            writeSourceFile(
                tmpDir,
                "src/config.ts",
                'const config = {\n  compressor: "babel-minify",\n  input: "src/*.js"\n};\n'
            );

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(1);
            expect(output).toContain("babel-minify");
            expect(output).toContain("src/config.ts");
            expect(output).toContain(":2");
        });

        test("should detect removed compressor in quoted assignment", async () => {
            writePackageJson(tmpDir);
            writeSourceFile(
                tmpDir,
                "src/build.js",
                "const opts = {\n  compressor: 'yui',\n};\n"
            );

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(1);
            expect(output).toContain("yui");
        });

        test("should not flag active compressor in assignment", async () => {
            writePackageJson(tmpDir);
            writeSourceFile(
                tmpDir,
                "src/config.ts",
                'const config = {\n  compressor: "terser",\n};\n'
            );

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(0);
            expect(output).toBe("");
        });
    });

    describe("recursive workspace scanning", () => {
        test("should detect removed dep in apps/*/package.json", async () => {
            writePackageJson(tmpDir); // root
            const appDir = join(tmpDir, "apps", "web");
            mkdirSync(appDir, { recursive: true });
            writePackageJson(appDir, {
                "@node-minify/babel-minify": "^10.0.0",
            });

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(1);
            expect(output).toContain("@node-minify/babel-minify");
            expect(output).toContain("apps");
        });

        test("should detect removed dep in deeply nested package.json", async () => {
            writePackageJson(tmpDir); // root
            const deepDir = join(tmpDir, "services", "api", "functions");
            mkdirSync(deepDir, { recursive: true });
            writePackageJson(deepDir, {
                "@node-minify/uglify-es": "^10.0.0",
            });

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(1);
            expect(output).toContain("@node-minify/uglify-es");
            expect(output).toContain("services");
        });

        test("should skip package.json in node_modules", async () => {
            writePackageJson(tmpDir);
            const nmDir = join(tmpDir, "node_modules", "some-pkg");
            mkdirSync(nmDir, { recursive: true });
            writePackageJson(nmDir, {
                "@node-minify/babel-minify": "^10.0.0",
            });

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(0);
            expect(output).toBe("");
        });
    });

    describe("peer and optional dependencies", () => {
        test("should detect removed dep in peerDependencies", async () => {
            const pkg = {
                name: "test-project",
                version: "1.0.0",
                peerDependencies: {
                    "@node-minify/sqwish": "^10.0.0",
                },
            };
            writeFileSync(
                join(tmpDir, "package.json"),
                JSON.stringify(pkg, null, 2)
            );

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(1);
            expect(output).toContain("@node-minify/sqwish");
        });

        test("should detect removed dep in optionalDependencies", async () => {
            const pkg = {
                name: "test-project",
                version: "1.0.0",
                optionalDependencies: {
                    "@node-minify/crass": "^10.0.0",
                },
            };
            writeFileSync(
                join(tmpDir, "package.json"),
                JSON.stringify(pkg, null, 2)
            );

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(1);
            expect(output).toContain("@node-minify/crass");
        });
    });

    describe("legacy-only findings", () => {
        test("should return 0 with warnings for legacy deps only", async () => {
            writePackageJson(tmpDir, {
                "@node-minify/jsonminify": "^10.0.0",
            });

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(0);
            expect(output).toContain("WARNING");
            expect(output).toContain("@node-minify/jsonminify");
            expect(output).toContain("legacy");
        });
    });

    describe("mixed findings", () => {
        test("should return 1 when both removed and legacy deps exist", async () => {
            writePackageJson(tmpDir, {
                "@node-minify/babel-minify": "^10.0.0",
                "@node-minify/jsonminify": "^10.0.0",
            });

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(1);
            expect(output).toContain("ERROR");
            expect(output).toContain("WARNING");
        });

        test("should report errors before warnings", async () => {
            writePackageJson(tmpDir, {
                "@node-minify/jsonminify": "^10.0.0",
                "@node-minify/babel-minify": "^10.0.0",
            });

            const { result, output } = await captureOutput(() =>
                runDoctor(tmpDir)
            );

            expect(result).toBe(1);
            const errorIdx = output.indexOf("ERROR");
            const warningIdx = output.indexOf("WARNING");
            expect(errorIdx).toBeLessThan(warningIdx);
        });
    });
});

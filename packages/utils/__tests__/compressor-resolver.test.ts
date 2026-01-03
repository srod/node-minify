/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { existsSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
    getKnownExportName,
    isBuiltInCompressor,
    resolveCompressor,
} from "../src/compressor-resolver.ts";
import { deleteFile, writeFile } from "../src/index.ts";

const tmpDir = path.resolve(__dirname, "../../../tests/tmp");
const testCompressorPath = path.join(tmpDir, "test-compressor.mjs");

describe("Package: utils/compressor-resolver", () => {
    const filesToCleanup = new Set<string>();

    afterEach(() => {
        for (const file of filesToCleanup) {
            try {
                if (existsSync(file)) {
                    deleteFile(file);
                }
            } catch {
                // Ignore cleanup errors
            }
        }
        filesToCleanup.clear();
        vi.resetModules();
    });

    describe("isBuiltInCompressor", () => {
        test("should return true for known compressors", () => {
            expect(isBuiltInCompressor("terser")).toBe(true);
            expect(isBuiltInCompressor("esbuild")).toBe(true);
            expect(isBuiltInCompressor("uglify-js")).toBe(true);
            expect(isBuiltInCompressor("clean-css")).toBe(true);
        });

        test("should return false for unknown compressors", () => {
            expect(isBuiltInCompressor("unknown-compressor")).toBe(false);
            expect(isBuiltInCompressor("my-custom-pkg")).toBe(false);
            expect(isBuiltInCompressor("")).toBe(false);
        });
    });

    describe("getKnownExportName", () => {
        test("should return export name for known compressors", () => {
            expect(getKnownExportName("terser")).toBe("terser");
            expect(getKnownExportName("uglify-js")).toBe("uglifyJs");
            expect(getKnownExportName("google-closure-compiler")).toBe("gcc");
            expect(getKnownExportName("clean-css")).toBe("cleanCss");
        });

        test("should return undefined for unknown compressors", () => {
            expect(getKnownExportName("unknown")).toBeUndefined();
            expect(getKnownExportName("my-custom")).toBeUndefined();
        });
    });

    describe("resolveCompressor", () => {
        describe("built-in compressors", () => {
            test("should resolve terser compressor", async () => {
                const result = await resolveCompressor("terser");
                expect(result.compressor).toBeTypeOf("function");
                expect(result.label).toBe("terser");
                expect(result.isBuiltIn).toBe(true);
            });

            test("should resolve esbuild compressor", async () => {
                const result = await resolveCompressor("esbuild");
                expect(result.compressor).toBeTypeOf("function");
                expect(result.label).toBe("esbuild");
                expect(result.isBuiltIn).toBe(true);
            });

            test("should resolve uglify-js compressor", async () => {
                const result = await resolveCompressor("uglify-js");
                expect(result.compressor).toBeTypeOf("function");
                expect(result.label).toBe("uglify-js");
                expect(result.isBuiltIn).toBe(true);
            });

            test("should resolve clean-css compressor", async () => {
                const result = await resolveCompressor("clean-css");
                expect(result.compressor).toBeTypeOf("function");
                expect(result.label).toBe("clean-css");
                expect(result.isBuiltIn).toBe(true);
            });
        });

        describe("local file compressors", () => {
            beforeEach(() => {
                filesToCleanup.add(testCompressorPath);
            });

            test("should resolve local file with first function export as fallback", async () => {
                const uniquePath = path.join(
                    tmpDir,
                    "first-fn-export-compressor.mjs"
                );
                filesToCleanup.add(uniquePath);
                const compressorCode = `
                    export const someValue = "not a function";
                    export async function myCustomFn({ content }) {
                        return { code: content.trim() };
                    }
                `;
                writeFile({ file: uniquePath, content: compressorCode });

                const result = await resolveCompressor(uniquePath);
                expect(result.compressor).toBeTypeOf("function");
                expect(result.isBuiltIn).toBe(false);
            });

            test("should resolve local file with default export", async () => {
                const compressorCode = `
                    export default async function({ content }) {
                        return { code: content.replace(/\\s+/g, ' ') };
                    }
                `;
                writeFile({
                    file: testCompressorPath,
                    content: compressorCode,
                });

                const result = await resolveCompressor(testCompressorPath);
                expect(result.compressor).toBeTypeOf("function");
                expect(result.label).toBe("test-compressor");
                expect(result.isBuiltIn).toBe(false);
            });

            test("should resolve local file with named 'compressor' export", async () => {
                const compressorCode = `
                    export async function compressor({ content }) {
                        return { code: content.toUpperCase() };
                    }
                `;
                writeFile({
                    file: testCompressorPath,
                    content: compressorCode,
                });

                const result = await resolveCompressor(testCompressorPath);
                expect(result.compressor).toBeTypeOf("function");
                expect(result.isBuiltIn).toBe(false);
            });

            test("should throw for non-existent local file", async () => {
                await expect(
                    resolveCompressor("./non-existent-file.js")
                ).rejects.toThrow("Could not load local compressor");
            });

            test("should throw for local file without valid export", async () => {
                const uniquePath = path.join(
                    tmpDir,
                    "no-export-compressor.mjs"
                );
                filesToCleanup.add(uniquePath);
                const emptyModule = `export const notAFunction = "hello";`;
                writeFile({ file: uniquePath, content: emptyModule });

                await expect(resolveCompressor(uniquePath)).rejects.toThrow(
                    "doesn't export a valid compressor function"
                );
            });

            test("should resolve local file with camelCase named export", async () => {
                const uniquePath = path.join(
                    tmpDir,
                    "camel-case-compressor.mjs"
                );
                filesToCleanup.add(uniquePath);
                const compressorCode = `
                    export async function camelCaseCompressor({ content }) {
                        return { code: content.toLowerCase() };
                    }
                `;
                writeFile({ file: uniquePath, content: compressorCode });

                const result = await resolveCompressor(uniquePath);
                expect(result.compressor).toBeTypeOf("function");
                expect(result.isBuiltIn).toBe(false);
            });

            test("should handle absolute paths", async () => {
                const absolutePath = path.resolve(
                    tmpDir,
                    "absolute-compressor.mjs"
                );
                filesToCleanup.add(absolutePath);
                const compressorCode = `
                    export default async function({ content }) {
                        return { code: content };
                    }
                `;
                writeFile({ file: absolutePath, content: compressorCode });

                const result = await resolveCompressor(absolutePath);
                expect(result.compressor).toBeTypeOf("function");
                expect(result.label).toBe("absolute-compressor");
                expect(result.isBuiltIn).toBe(false);
            });
        });

        describe("npm package compressors", () => {
            test("should throw for non-existent npm package", async () => {
                await expect(
                    resolveCompressor("non-existent-npm-package-12345")
                ).rejects.toThrow("Could not resolve compressor");
            });

            test("should resolve npm package with valid export", async () => {
                const result = await resolveCompressor("picocolors");
                expect(result.compressor).toBeTypeOf("function");
                expect(result.isBuiltIn).toBe(false);
            });

            test("should throw for non-existent scoped npm package", async () => {
                await expect(
                    resolveCompressor("@nonexistent-scope/fake-package")
                ).rejects.toThrow("Could not resolve compressor");
            });

            test("should throw specific error for missing local file", async () => {
                const missingPath = "./non-existent-file.js";
                await expect(resolveCompressor(missingPath)).rejects.toThrow(
                    "Could not load local compressor"
                );
            });

            test("should throw for local file with syntax error", async () => {
                const syntaxErrorPath = path.join(tmpDir, "syntax-error.mjs");
                filesToCleanup.add(syntaxErrorPath);
                // Invalid JS syntax
                writeFile({
                    file: syntaxErrorPath,
                    content: "export const foo = ;",
                });

                // We need to pass a path that looks local to the resolver logic (absolute path is fine)
                // But resolveCompressor uses process.cwd() for relative paths.
                // Using absolute path is safer for test execution.
                await expect(
                    resolveCompressor(syntaxErrorPath)
                ).rejects.toThrow("Could not load local compressor");
            });
        });

        describe("error messages", () => {
            test("should suggest local path format for unknown packages", async () => {
                await expect(
                    resolveCompressor("unknown-package")
                ).rejects.toThrow(
                    "For local files, use a path starting with './' or '/'"
                );
            });
        });
    });
});

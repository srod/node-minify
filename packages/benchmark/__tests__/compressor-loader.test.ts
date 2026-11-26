/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe, expect, test } from "vitest";
import { loadCompressor } from "../src/compressor-loader.ts";

describe("Compressor Loader", () => {
    test("should load compressor by name", async () => {
        const compressor = await loadCompressor("terser");
        expect(compressor).toBeDefined();
        expect(typeof compressor).toBe("function");
    });

    test("should load esbuild compressor", async () => {
        const compressor = await loadCompressor("esbuild");
        expect(compressor).toBeDefined();
        expect(typeof compressor).toBe("function");
    });

    test("should load swc compressor", async () => {
        const compressor = await loadCompressor("swc");
        expect(compressor).toBeDefined();
        expect(typeof compressor).toBe("function");
    });

    test("should reject with the resolver error for non-existent compressor", async () => {
        await expect(loadCompressor("non-existent-compressor")).rejects.toThrow(
            "Could not resolve compressor 'non-existent-compressor'"
        );
    });

    test("should reject with the resolver error for non-existent package", async () => {
        await expect(
            loadCompressor("@node-minify/fake-package")
        ).rejects.toThrow(
            "Could not resolve compressor '@node-minify/fake-package'"
        );
    });

    test("should reject with the removed-compressor message for a removed name", async () => {
        await expect(loadCompressor("yui")).rejects.toThrow(
            "Compressor 'yui' was removed in v11. Use 'terser or lightningcss' instead."
        );
    });

    test("should load clean-css compressor", async () => {
        const compressor = await loadCompressor("clean-css");
        expect(compressor).toBeDefined();
        expect(typeof compressor).toBe("function");
    });

    test("should load cssnano compressor", async () => {
        const compressor = await loadCompressor("cssnano");
        expect(compressor).toBeDefined();
        expect(typeof compressor).toBe("function");
    });

    test("should load csso compressor", async () => {
        const compressor = await loadCompressor("csso");
        expect(compressor).toBeDefined();
        expect(typeof compressor).toBe("function");
    });

    test("should load lightningcss compressor", async () => {
        const compressor = await loadCompressor("lightningcss");
        expect(compressor).toBeDefined();
        expect(typeof compressor).toBe("function");
    });

    test("should load html-minifier compressor", async () => {
        const compressor = await loadCompressor("html-minifier");
        expect(compressor).toBeDefined();
        expect(typeof compressor).toBe("function");
    });

    test("should load jsonminify compressor", async () => {
        const compressor = await loadCompressor("jsonminify");
        expect(compressor).toBeDefined();
        expect(typeof compressor).toBe("function");
    });

    test("should handle multiple consecutive loads", async () => {
        const terser = await loadCompressor("terser");
        const esbuild = await loadCompressor("esbuild");
        const swc = await loadCompressor("swc");

        expect(terser).toBeDefined();
        expect(esbuild).toBeDefined();
        expect(swc).toBeDefined();
        expect(typeof terser).toBe("function");
        expect(typeof esbuild).toBe("function");
        expect(typeof swc).toBe("function");
    });

    test("should return consistent results for same compressor", async () => {
        const compressor1 = await loadCompressor("terser");
        const compressor2 = await loadCompressor("terser");

        expect(compressor1).toBe(compressor2);
    });
});

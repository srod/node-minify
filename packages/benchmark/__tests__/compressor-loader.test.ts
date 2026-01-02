/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
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

    test("should return null for non-existent compressor", async () => {
        const compressor = await loadCompressor("non-existent-compressor");
        expect(compressor).toBeNull();
    });

    test("should return null for non-existent package", async () => {
        const compressor = await loadCompressor("@node-minify/fake-package");
        expect(compressor).toBeNull();
    });

    test("should handle import errors gracefully", async () => {
        const compressor = await loadCompressor("invalid-module");
        expect(compressor).toBeNull();
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

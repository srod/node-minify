import { describe, expect, test } from "vitest";
import {
    COMPRESSOR_REGISTRY,
    getCompressorEntry,
    getCompressorsByStatus,
} from "../src/compressor-registry.ts";

describe("COMPRESSOR_REGISTRY", () => {
    test("contains exactly 22 compressors", () => {
        expect(COMPRESSOR_REGISTRY).toHaveLength(22);
    });

    test("has 9 recommended compressors", () => {
        const recommended = getCompressorsByStatus("recommended");
        expect(recommended).toHaveLength(9);
    });

    test("has 6 supported compressors", () => {
        const supported = getCompressorsByStatus("supported");
        expect(supported).toHaveLength(6);
    });

    test("has 2 legacy compressors", () => {
        const legacy = getCompressorsByStatus("legacy");
        expect(legacy).toHaveLength(2);
    });

    test("has 5 removed compressors", () => {
        const removed = getCompressorsByStatus("removed");
        expect(removed).toHaveLength(5);
    });

    test("all entries have required fields", () => {
        COMPRESSOR_REGISTRY.forEach((entry) => {
            expect(entry).toHaveProperty("name");
            expect(entry).toHaveProperty("status");
            expect(entry).toHaveProperty("packageName");
            expect(typeof entry.name).toBe("string");
            expect(typeof entry.status).toBe("string");
            expect(typeof entry.packageName).toBe("string");
        });
    });

    test("all packageNames follow @node-minify/<name> format", () => {
        COMPRESSOR_REGISTRY.forEach((entry) => {
            expect(entry.packageName).toMatch(/^@node-minify\//);
        });
    });

    test("removed compressors have replacement field", () => {
        const removed = getCompressorsByStatus("removed");
        removed.forEach((entry) => {
            expect(entry.replacement).toBeDefined();
            expect(typeof entry.replacement).toBe("string");
        });
    });
});

describe("getCompressorsByStatus", () => {
    test("returns all recommended compressors", () => {
        const recommended = getCompressorsByStatus("recommended");
        const names = recommended.map((e) => e.name);
        expect(names).toContain("terser");
        expect(names).toContain("oxc");
        expect(names).toContain("swc");
        expect(names).toContain("esbuild");
        expect(names).toContain("lightningcss");
        expect(names).toContain("cssnano");
        expect(names).toContain("minify-html");
        expect(names).toContain("sharp");
        expect(names).toContain("svgo");
    });

    test("returns all supported compressors", () => {
        const supported = getCompressorsByStatus("supported");
        const names = supported.map((e) => e.name);
        expect(names).toContain("clean-css");
        expect(names).toContain("csso");
        expect(names).toContain("uglify-js");
        expect(names).toContain("google-closure-compiler");
        expect(names).toContain("imagemin");
        expect(names).toContain("html-minifier");
    });

    test("returns legacy compressor", () => {
        const legacy = getCompressorsByStatus("legacy");
        expect(legacy).toHaveLength(2);
        const names = legacy.map((entry) => entry.name);
        expect(names).toContain("jsonminify");
        expect(names).toContain("no-compress");
    });

    test("returns all removed compressors", () => {
        const removed = getCompressorsByStatus("removed");
        const names = removed.map((e) => e.name);
        expect(names).toContain("babel-minify");
        expect(names).toContain("uglify-es");
        expect(names).toContain("yui");
        expect(names).toContain("sqwish");
        expect(names).toContain("crass");
    });
});

describe("getCompressorEntry", () => {
    test("returns entry for existing compressor", () => {
        const entry = getCompressorEntry("terser");
        expect(entry).toBeDefined();
        expect(entry?.name).toBe("terser");
        expect(entry?.status).toBe("recommended");
        expect(entry?.packageName).toBe("@node-minify/terser");
    });

    test("returns undefined for non-existent compressor", () => {
        const entry = getCompressorEntry("non-existent");
        expect(entry).toBeUndefined();
    });

    test("returns entry with replacement for removed compressor", () => {
        const entry = getCompressorEntry("babel-minify");
        expect(entry).toBeDefined();
        expect(entry?.status).toBe("removed");
        expect(entry?.replacement).toBe("terser");
    });

    test("returns entry when looked up by scoped package name", () => {
        const entry = getCompressorEntry("@node-minify/yui");
        expect(entry).toBeDefined();
        expect(entry?.name).toBe("yui");
        expect(entry?.status).toBe("removed");
    });

    test("returns entry for yui with replacement", () => {
        const entry = getCompressorEntry("yui");
        expect(entry).toBeDefined();
        if (entry) {
            expect(entry.status).toBe("removed");
            expect(entry.replacement).toBeDefined();
        }
    });

    test("returns entry for legacy compressor", () => {
        const entry = getCompressorEntry("jsonminify");
        expect(entry).toBeDefined();
        expect(entry?.status).toBe("legacy");
    });

    test("returns entry for no-compress", () => {
        const entry = getCompressorEntry("no-compress");
        expect(entry).toBeDefined();
        expect(entry?.status).toBe("legacy");
    });
});

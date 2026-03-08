/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe, expect, test } from "vitest";
import {
    type CompressorSelection,
    detectFileType,
    type FileType,
    groupFilesByType,
    selectCompressor,
} from "../src/autoDetect.ts";

describe("autoDetect", () => {
    describe("detectFileType", () => {
        test("detects .js files as js", () => {
            expect(detectFileType("app.js")).toBe("js");
        });

        test("detects .jsx files as js", () => {
            expect(detectFileType("Component.jsx")).toBe("js");
        });

        test("detects .mjs files as js", () => {
            expect(detectFileType("module.mjs")).toBe("js");
        });

        test("detects .cjs files as js", () => {
            expect(detectFileType("config.cjs")).toBe("js");
        });

        test("detects .css files as css", () => {
            expect(detectFileType("styles.css")).toBe("css");
        });

        test("detects .html files as html", () => {
            expect(detectFileType("index.html")).toBe("html");
        });

        test("detects .htm files as html", () => {
            expect(detectFileType("page.htm")).toBe("html");
        });

        test("detects .json files as json", () => {
            expect(detectFileType("data.json")).toBe("json");
        });

        test("detects .svg files as svg", () => {
            expect(detectFileType("logo.svg")).toBe("svg");
        });

        test("detects unknown extensions as unknown", () => {
            expect(detectFileType("file.xyz")).toBe("unknown");
        });

        test("excludes .ts files (returns unknown)", () => {
            expect(detectFileType("app.ts")).toBe("unknown");
        });

        test("excludes .tsx files (returns unknown)", () => {
            expect(detectFileType("Component.tsx")).toBe("unknown");
        });

        test("excludes .mts files (returns unknown)", () => {
            expect(detectFileType("module.mts")).toBe("unknown");
        });

        test("excludes .cts files (returns unknown)", () => {
            expect(detectFileType("config.cts")).toBe("unknown");
        });

        test("handles case-insensitive extensions", () => {
            expect(detectFileType("APP.JS")).toBe("js");
            expect(detectFileType("STYLES.CSS")).toBe("css");
        });

        test("handles paths with directories", () => {
            expect(detectFileType("src/components/Button.jsx")).toBe("js");
            expect(detectFileType("/absolute/path/to/styles.css")).toBe("css");
        });
    });

    describe("selectCompressor", () => {
        test("selects terser for js files", () => {
            const result = selectCompressor("js");
            expect(result.compressor).toBe("terser");
            expect(result.package).toBe("@node-minify/terser");
            expect(result.type).toBeUndefined();
        });

        test("selects lightningcss for css files", () => {
            const result = selectCompressor("css");
            expect(result.compressor).toBe("lightningcss");
            expect(result.package).toBe("@node-minify/lightningcss");
            expect(result.type).toBeUndefined();
        });

        test("selects html-minifier for html files", () => {
            const result = selectCompressor("html");
            expect(result.compressor).toBe("html-minifier");
            expect(result.package).toBe("@node-minify/html-minifier");
            expect(result.type).toBeUndefined();
        });

        test("selects jsonminify for json files", () => {
            const result = selectCompressor("json");
            expect(result.compressor).toBe("jsonminify");
            expect(result.package).toBe("@node-minify/jsonminify");
            expect(result.type).toBeUndefined();
        });

        test("selects svgo for svg files", () => {
            const result = selectCompressor("svg");
            expect(result.compressor).toBe("svgo");
            expect(result.package).toBe("@node-minify/svgo");
            expect(result.type).toBeUndefined();
        });

        test("selects no-compress for unknown files", () => {
            const result = selectCompressor("unknown");
            expect(result.compressor).toBe("no-compress");
            expect(result.package).toBe("@node-minify/no-compress");
            expect(result.type).toBeUndefined();
        });

        test("returns CompressorSelection with correct structure", () => {
            const result: CompressorSelection = selectCompressor("js");
            expect(result).toHaveProperty("compressor");
            expect(result).toHaveProperty("package");
        });
    });

    describe("groupFilesByType", () => {
        test("groups files by detected type", () => {
            const files = ["a.js", "b.css", "c.js", "d.html"];
            const groups = groupFilesByType(files);

            expect(groups.js).toEqual(["a.js", "c.js"]);
            expect(groups.css).toEqual(["b.css"]);
            expect(groups.html).toEqual(["d.html"]);
            expect(groups.json).toEqual([]);
            expect(groups.svg).toEqual([]);
            expect(groups.unknown).toEqual([]);
        });

        test("handles mixed file types", () => {
            const files = [
                "app.js",
                "styles.css",
                "index.html",
                "data.json",
                "logo.svg",
                "file.xyz",
            ];
            const groups = groupFilesByType(files);

            expect(groups.js).toEqual(["app.js"]);
            expect(groups.css).toEqual(["styles.css"]);
            expect(groups.html).toEqual(["index.html"]);
            expect(groups.json).toEqual(["data.json"]);
            expect(groups.svg).toEqual(["logo.svg"]);
            expect(groups.unknown).toEqual(["file.xyz"]);
        });

        test("handles empty array", () => {
            const groups = groupFilesByType([]);

            expect(groups.js).toEqual([]);
            expect(groups.css).toEqual([]);
            expect(groups.html).toEqual([]);
            expect(groups.json).toEqual([]);
            expect(groups.svg).toEqual([]);
            expect(groups.unknown).toEqual([]);
        });

        test("handles all files of same type", () => {
            const files = ["a.js", "b.js", "c.js"];
            const groups = groupFilesByType(files);

            expect(groups.js).toEqual(["a.js", "b.js", "c.js"]);
            expect(groups.css).toEqual([]);
        });

        test("excludes TypeScript files (groups as unknown)", () => {
            const files = ["app.ts", "Component.tsx", "module.mts"];
            const groups = groupFilesByType(files);

            expect(groups.js).toEqual([]);
            expect(groups.unknown).toEqual([
                "app.ts",
                "Component.tsx",
                "module.mts",
            ]);
        });

        test("preserves file order within groups", () => {
            const files = ["z.js", "a.js", "m.js"];
            const groups = groupFilesByType(files);

            expect(groups.js).toEqual(["z.js", "a.js", "m.js"]);
        });

        test("handles paths with directories", () => {
            const files = [
                "src/app.js",
                "dist/styles.css",
                "public/index.html",
            ];
            const groups = groupFilesByType(files);

            expect(groups.js).toEqual(["src/app.js"]);
            expect(groups.css).toEqual(["dist/styles.css"]);
            expect(groups.html).toEqual(["public/index.html"]);
        });
    });

    describe("type exports", () => {
        test("FileType includes all expected values", () => {
            const validTypes: FileType[] = [
                "js",
                "css",
                "html",
                "json",
                "svg",
                "unknown",
            ];
            expect(validTypes).toHaveLength(6);
        });

        test("CompressorSelection has required properties", () => {
            const selection: CompressorSelection = {
                compressor: "terser",
                package: "@node-minify/terser",
            };
            expect(selection.compressor).toBe("terser");
            expect(selection.package).toBe("@node-minify/terser");
        });

        test("CompressorSelection type property is optional", () => {
            const withType: CompressorSelection = {
                compressor: "esbuild",
                type: "js",
                package: "@node-minify/esbuild",
            };
            expect(withType.type).toBe("js");

            const withoutType: CompressorSelection = {
                compressor: "terser",
                package: "@node-minify/terser",
            };
            expect(withoutType.type).toBeUndefined();
        });
    });
});

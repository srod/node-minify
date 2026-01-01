/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { minify } from "@node-minify/core";
import { describe, expect, test } from "vitest";

const simpleJS = `
function hello(name) {
    var greeting = "Hello, " + name + "!";
    console.log(greeting);
    return greeting;
}
hello("World");
`;

const simpleCSS = `
body {
    background-color: #ffffff;
    margin: 0;
    padding: 0;
}
`;

describe("Deprecated Compressor Smoke Tests", () => {
    describe("uglify-es (deprecated)", () => {
        test("should still minify JavaScript", async () => {
            const { uglifyEs } = await import("@node-minify/uglify-es");

            const result = await minify({
                compressor: uglifyEs,
                content: simpleJS,
            });

            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
            expect((result as string).length).toBeLessThan(simpleJS.length);
            expect(result).toContain("hello");
        });
    });

    describe("babel-minify (deprecated)", () => {
        test("should still minify JavaScript", async () => {
            const { babelMinify } = await import("@node-minify/babel-minify");

            const result = await minify({
                compressor: babelMinify,
                content: simpleJS,
            });

            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
            expect((result as string).length).toBeLessThan(simpleJS.length);
        });
    });

    describe("crass (deprecated)", () => {
        test("should still minify CSS", async () => {
            const { crass } = await import("@node-minify/crass");

            const result = await minify({
                compressor: crass,
                content: simpleCSS,
            });

            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
            expect((result as string).length).toBeLessThan(simpleCSS.length);
            expect(result).toContain("body");
        });
    });

    describe("sqwish (deprecated)", () => {
        test("should still minify CSS", async () => {
            const { sqwish } = await import("@node-minify/sqwish");

            const result = await minify({
                compressor: sqwish,
                content: simpleCSS,
            });

            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
            expect((result as string).length).toBeLessThan(simpleCSS.length);
            expect(result).toContain("body");
        });
    });
});

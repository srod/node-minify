/*! node-minify action tests - MIT Licensed */

import { describe, expect, test } from "vitest";
import { validateOutputDir } from "../src/validate.ts";

describe("validateOutputDir", () => {
    test("does not throw when output is outside all source patterns", () => {
        expect(() => {
            validateOutputDir("dist", ["src/**/*.js"]);
        }).not.toThrow();
    });

    test("throws when output directory is inside a source pattern", () => {
        expect(() => {
            validateOutputDir("src", ["src/**/*.js"]);
        }).toThrow(/output-dir cannot be inside/);
    });

    test("throws when output is nested inside source pattern", () => {
        expect(() => {
            validateOutputDir("src/dist", ["src/**/*.js"]);
        }).toThrow(/output-dir cannot be inside/);
    });

    test("does not throw when output is outside multiple source patterns", () => {
        expect(() => {
            validateOutputDir("dist", ["src/**/*.js", "lib/**/*.css"]);
        }).not.toThrow();
    });

    test("throws when output matches any source pattern in array", () => {
        expect(() => {
            validateOutputDir("lib", ["src/**/*.js", "lib/**/*.css"]);
        }).toThrow(/output-dir cannot be inside/);
    });

    test("throws when output nested in source pattern using relative path", () => {
        expect(() => {
            validateOutputDir("src/dist", ["src/**"]);
        }).toThrow(/output-dir cannot be inside/);
    });

    test("throws when output same as source pattern using relative path", () => {
        expect(() => {
            validateOutputDir("./src", ["src/**"]);
        }).toThrow(/output-dir cannot be inside/);
    });

    test("does not throw when output is outside using relative path traversal", () => {
        expect(() => {
            validateOutputDir("../outside", ["src/**"]);
        }).not.toThrow();
    });

    test("error message includes output directory name", () => {
        expect(() => {
            validateOutputDir("src/build", ["src/**/*.js"]);
        }).toThrow(/src\/build/);
    });

    test("error message includes source pattern", () => {
        expect(() => {
            validateOutputDir("src/build", ["src/**/*.js"]);
        }).toThrow(/src\/\*\*\/\*\.js/);
    });
});

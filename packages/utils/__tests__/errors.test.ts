import { describe, expect, test } from "vitest";
import { validateMinifyResult, wrapMinificationError } from "../src/errors.ts";

describe("wrapMinificationError", () => {
    test("wraps Error with message and preserves cause", () => {
        const originalError = new Error("Parse error at line 5");
        const wrapped = wrapMinificationError("terser", originalError);

        expect(wrapped).toBeInstanceOf(Error);
        expect(wrapped.message).toBe(
            "terser minification failed: Parse error at line 5"
        );
        expect(wrapped.cause).toBe(originalError);
    });

    test("wraps string error without cause", () => {
        const wrapped = wrapMinificationError("oxc", "unexpected token");

        expect(wrapped).toBeInstanceOf(Error);
        expect(wrapped.message).toBe(
            "oxc minification failed: unexpected token"
        );
        expect(wrapped.cause).toBeUndefined();
    });

    test("wraps null/undefined without cause", () => {
        const wrappedNull = wrapMinificationError("csso", null);
        const wrappedUndefined = wrapMinificationError("csso", undefined);

        expect(wrappedNull.message).toBe("csso minification failed: null");
        expect(wrappedNull.cause).toBeUndefined();
        expect(wrappedUndefined.message).toBe(
            "csso minification failed: undefined"
        );
        expect(wrappedUndefined.cause).toBeUndefined();
    });

    test("wraps object error without cause", () => {
        const wrapped = wrapMinificationError("clean-css", { code: "E001" });

        expect(wrapped.message).toBe(
            "clean-css minification failed: [object Object]"
        );
        expect(wrapped.cause).toBeUndefined();
    });
});

describe("validateMinifyResult", () => {
    test("passes valid result with code string", () => {
        const result = { code: "minified content" };

        expect(() => validateMinifyResult(result, "terser")).not.toThrow();
    });

    test("passes result with code and map", () => {
        const result = { code: "minified", map: "sourcemap" };

        expect(() => validateMinifyResult(result, "terser")).not.toThrow();
    });

    test("throws on null result", () => {
        expect(() => validateMinifyResult(null, "oxc")).toThrow(
            "oxc failed: empty or invalid result"
        );
    });

    test("throws on undefined result", () => {
        expect(() => validateMinifyResult(undefined, "cssnano")).toThrow(
            "cssnano failed: empty or invalid result"
        );
    });

    test("throws on result without code property", () => {
        const result = { css: "some css" };

        expect(() => validateMinifyResult(result, "csso")).toThrow(
            "csso failed: empty or invalid result"
        );
    });

    test("throws when code is not a string", () => {
        const result = { code: 123 };

        expect(() => validateMinifyResult(result, "terser")).toThrow(
            "terser failed: empty or invalid result"
        );
    });

    test("throws on empty object", () => {
        expect(() => validateMinifyResult({}, "minify-html")).toThrow(
            "minify-html failed: empty or invalid result"
        );
    });

    test("allows empty string as code", () => {
        const result = { code: "" };

        expect(() => validateMinifyResult(result, "terser")).not.toThrow();
    });
});

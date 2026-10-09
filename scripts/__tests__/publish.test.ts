/*! node-minify - MIT Licensed */

import { describe, expect, test } from "vitest";
import { isPublished } from "../publish.ts";

const e404 = JSON.stringify({ error: { code: "E404", summary: "Not found" } });

describe("isPublished", () => {
    test("is true when npm view returns the exact version", () => {
        expect(
            isPublished("11.0.0", { status: 0, stdout: '"11.0.0"', stderr: "" })
        ).toBe(true);
        expect(
            isPublished("11.0.0", {
                status: 0,
                stdout: '[\n  "11.0.0"\n]',
                stderr: "",
            })
        ).toBe(true);
    });

    test("is false when npm view answers E404", () => {
        expect(
            isPublished("11.0.1", { status: 1, stdout: e404, stderr: "" })
        ).toBe(false);
    });

    test("is false when npm view succeeds without the version", () => {
        expect(
            isPublished("11.0.1", { status: 0, stdout: "", stderr: "" })
        ).toBe(false);
    });

    test("throws on any other npm view failure", () => {
        const e403 = JSON.stringify({ error: { code: "E403" } });
        expect(() =>
            isPublished("11.0.1", { status: 1, stdout: e403, stderr: "" })
        ).toThrow(/npm view failed/);
        expect(() =>
            isPublished("11.0.1", {
                status: 1,
                stdout: "",
                stderr: "network down",
            })
        ).toThrow(/network down/);
    });
});

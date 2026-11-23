/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";
import type { Compressor } from "@node-minify/types";
import { describe, expect, test } from "vitest";
import { setup } from "../src/setup.ts";

const compressor: Compressor = async () => ({ code: "" });
const noMatch = path
    .join(os.tmpdir(), `node-minify-no-such-dir-${randomUUID()}`, "**", "*.js")
    .replaceAll("\\", "/");

describe("setup glob with no matching files", () => {
    test("throws when a string glob with $1 output matches no file", () => {
        expect(() =>
            setup({
                compressor,
                input: noMatch,
                output: "out/$1.min.js",
            })
        ).toThrow("No files matched input pattern");
    });

    test("throws when a string glob with plain output matches no file", () => {
        expect(() =>
            setup({
                compressor,
                input: noMatch,
                output: "out.js",
            })
        ).toThrow("No files matched input pattern");
    });

    test("throws when an array containing only an unmatched glob is given", () => {
        expect(() =>
            setup({
                compressor,
                input: [noMatch],
                output: "out.js",
            })
        ).toThrow("No files matched input pattern");
    });

    test("includes the unmatched pattern in the error message", () => {
        expect(() =>
            setup({
                compressor,
                input: noMatch,
                output: "out.js",
            })
        ).toThrow(noMatch);
    });

    test("does not throw from setup for a non-glob missing file", () => {
        expect(() =>
            setup({
                compressor,
                input: "missing.js",
                output: "out.js",
            })
        ).not.toThrow();
    });

    test("does not throw from setup in in-memory mode", () => {
        expect(() =>
            setup({
                compressor,
                content: "var a = 1;",
            })
        ).not.toThrow();
    });
});

/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe, expect, test } from "vitest";
import { isValidFileAsync } from "../src/isValidFile.ts";
import path from "path";

describe("isValidFileAsync", () => {
    const fixtureFile = path.join(__dirname, "../../../tests/fixtures/fixture-content.js");
    const fixtureDir = path.join(__dirname, "../../../tests/fixtures");

    test("should return true for a valid file", async () => {
        expect(await isValidFileAsync(fixtureFile)).toBe(true);
    });

    test("should return false for a non-existent file", async () => {
        expect(await isValidFileAsync("fake.js")).toBe(false);
    });

    test("should return false for a directory", async () => {
        expect(await isValidFileAsync(fixtureDir)).toBe(false);
    });
});

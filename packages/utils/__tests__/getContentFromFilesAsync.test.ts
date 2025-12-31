/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { lstat } from "node:fs/promises";
import { describe, expect, test, vi } from "vitest";
import { getContentFromFilesAsync } from "../src/getContentFromFiles.ts";

vi.mock("node:fs/promises", async (importOriginal) => {
    const actual = await importOriginal<typeof import("node:fs/promises")>();
    return {
        ...actual,
        lstat: vi.fn(actual.lstat),
    };
});

const fixtureFile = `${__dirname}/../../../tests/fixtures/fixture-content.js`;

describe("getContentFromFilesAsync", () => {
    test("should return content from a single file", async () => {
        const content = await getContentFromFilesAsync(fixtureFile);
        expect(content).toContain("console.log('content');");
    });

    test("should return content from multiple files", async () => {
        const content = await getContentFromFilesAsync([
            fixtureFile,
            fixtureFile,
        ]);
        expect(content).toContain("console.log('content');");
        // Check if content is duplicated (concatenated)
        const matches = content.match(/console\.log\('content'\);/g);
        expect(matches?.length).toBe(2);
    });

    test("should return empty string for empty array", async () => {
        expect(await getContentFromFilesAsync([])).toBe("");
    });

    test("should throw if input is null", async () => {
        await expect(getContentFromFilesAsync(null as any)).rejects.toThrow(
            "Input must be a string or array of strings"
        );
    });

    test("should throw if one file does not exist", async () => {
        await expect(
            getContentFromFilesAsync([fixtureFile, "fake.js"])
        ).rejects.toThrow("File does not exist");
    });

    test("should throw if one path is a directory", async () => {
        await expect(
            getContentFromFilesAsync([fixtureFile, __dirname])
        ).rejects.toThrow();
    });

    test("should throw if path is not a valid file (async check)", async () => {
        await expect(getContentFromFilesAsync("fake.js")).rejects.toThrow(
            "File does not exist"
        );
    });

    test("should throw if lstat fails with non-ENOENT error", async () => {
        vi.mocked(lstat).mockRejectedValueOnce(new Error("Generic FS error"));
        await expect(getContentFromFilesAsync(fixtureFile)).rejects.toThrow(
            "Generic FS error"
        );
    });
});

/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { lstat } from "node:fs/promises";
import { describe, expect, test, vi } from "vitest";
import { FileOperationError } from "../src/error.ts";
import { isValidFileAsync } from "../src/isValidFile.ts";

vi.mock("node:fs/promises", async (importOriginal) => {
    const actual = await importOriginal<typeof import("node:fs/promises")>();
    return {
        ...actual,
        lstat: vi.fn(actual.lstat),
    };
});

describe("isValidFileAsync", () => {
    test("should return true if file exists and is not a directory", async () => {
        const result = await isValidFileAsync(__filename);
        expect(result).toBe(true);
    });

    test("should return false if file does not exist", async () => {
        const result = await isValidFileAsync("non-existent-file.js");
        expect(result).toBe(false);
    });

    test("should return false if path is a directory", async () => {
        const result = await isValidFileAsync(__dirname);
        expect(result).toBe(false);
    });

    test("should throw FileOperationError if lstat fails with non-ENOENT error", async () => {
        vi.mocked(lstat).mockRejectedValueOnce(new Error("Unknown FS error"));
        await expect(isValidFileAsync("some-file.js")).rejects.toThrow(
            FileOperationError
        );
    });
});

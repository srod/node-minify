/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe, expect, test } from "vitest";
import { FileOperationError } from "../src/error.ts";

describe("FileOperationError cause", () => {
    test("is the original error when one is given", () => {
        const original = new Error("boom");

        const error = new FileOperationError("read", "x", original);

        expect(error.cause).toBe(original);
        expect(error.message).toBe("Failed to read file x: boom");
    });

    // v11 keeps cause as an enumerable own property; v12 moves to the native, non-enumerable one
    test("is an enumerable own property in v11", () => {
        const error = new FileOperationError("read", "x", new Error("boom"));

        expect(Object.keys(error)).toContain("cause");
        expect("cause" in new FileOperationError("read", "x")).toBe(true);
    });

    test("is undefined without an original error", () => {
        const error = new FileOperationError("read", "x");

        expect(error.cause).toBeUndefined();
        expect(error.message).toBe("Failed to read file x: ");
    });
});

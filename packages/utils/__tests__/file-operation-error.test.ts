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

    test("is undefined without an original error", () => {
        const error = new FileOperationError("read", "x");

        expect(error.cause).toBeUndefined();
        expect(error.message).toBe("Failed to read file x: ");
    });
});

/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import {
    buildArgs,
    FileOperationError,
    readFileAsync,
    ValidationError,
} from "../src/index.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("error classes exported from the package entry", () => {
    test("FileOperationError is the class utils throws for a missing file", async () => {
        const missing = path.join(__dirname, "does-not-exist.txt");

        const error = await readFileAsync(missing).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(FileOperationError);
        expect((error as FileOperationError).name).toBe("FileOperationError");
        expect((error as FileOperationError).cause).toBeInstanceOf(Error);
    });

    test("ValidationError is the class utils throws for invalid input", () => {
        // @ts-expect-error testing invalid input: buildArgs requires a non-null options object
        expect(() => buildArgs(null)).toThrow(ValidationError);
    });
});

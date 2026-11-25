/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, test } from "vitest";
import { FileOperationError } from "../src/error.ts";
import {
    getFilesizeBrotliInBytes,
    getFilesizeBrotliRaw,
} from "../src/getFilesizeBrotliInBytes.ts";
import {
    getFilesizeGzippedInBytes,
    getFilesizeGzippedRaw,
} from "../src/getFilesizeGzippedInBytes.ts";

const dir = mkdtempSync(join(tmpdir(), "nm-filesize-guards-"));
const missing = join(dir, "missing.js");

afterAll(() => rmSync(dir, { recursive: true, force: true }));

const helpers = {
    getFilesizeGzippedInBytes,
    getFilesizeGzippedRaw,
    getFilesizeBrotliInBytes,
    getFilesizeBrotliRaw,
};

describe.each(Object.entries(helpers))("%s guards", (_name, helper) => {
    test("rejects a missing file", async () => {
        const error = await helper(missing).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(FileOperationError);
        expect((error as FileOperationError).message).toBe(
            `Failed to access file ${missing}: File does not exist`
        );
    });

    test("rejects a directory", async () => {
        const error = await helper(dir).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(FileOperationError);
        expect((error as FileOperationError).message).toBe(
            `Failed to access file ${dir}: Path is not a valid file`
        );
    });
});

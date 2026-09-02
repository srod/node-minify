/*! node-minify filesize error-path tests - MIT Licensed */

import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

// Force the read to fail with a generic (non-FileOperationError) error so the
// size helpers exercise their error-wrapping branch. The file still exists, so
// the existsSync / isValidFile guards pass first.
vi.mock("node:fs/promises", async (importOriginal) => {
    const actual = await importOriginal<typeof import("node:fs/promises")>();
    return {
        ...actual,
        readFile: vi.fn().mockRejectedValue(new Error("boom read")),
    };
});

import { FileOperationError } from "../src/error.ts";
import {
    getFilesizeBrotliInBytes,
    getFilesizeBrotliRaw,
} from "../src/getFilesizeBrotliInBytes.ts";
import {
    getFilesizeGzippedInBytes,
    getFilesizeGzippedRaw,
} from "../src/getFilesizeGzippedInBytes.ts";

const dir = mkdtempSync(join(tmpdir(), "nm-filesize-"));
const file = join(dir, "f.js");
writeFileSync(file, "console.log(1);");

describe("filesize helpers wrap non-FileOperationError failures", () => {
    test("getFilesizeGzippedInBytes wraps a read failure", async () => {
        await expect(getFilesizeGzippedInBytes(file)).rejects.toBeInstanceOf(
            FileOperationError
        );
        await expect(getFilesizeGzippedInBytes(file)).rejects.toThrow(
            "get gzipped size of"
        );
    });

    test("getFilesizeGzippedRaw wraps a read failure", async () => {
        await expect(getFilesizeGzippedRaw(file)).rejects.toThrow(
            "get gzipped size of"
        );
    });

    test("getFilesizeBrotliInBytes wraps a read failure", async () => {
        await expect(getFilesizeBrotliInBytes(file)).rejects.toBeInstanceOf(
            FileOperationError
        );
        await expect(getFilesizeBrotliInBytes(file)).rejects.toThrow(
            "get brotli size of"
        );
    });

    test("getFilesizeBrotliRaw wraps a read failure", async () => {
        await expect(getFilesizeBrotliRaw(file)).rejects.toThrow(
            "get brotli size of"
        );
    });
});

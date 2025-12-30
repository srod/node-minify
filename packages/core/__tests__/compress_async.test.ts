import fs from "node:fs";
import path from "node:path";
import type { Settings } from "@node-minify/types";
import { afterAll, describe, expect, test } from "vitest";
import { noCompress } from "../../no-compress/src/index.ts";
import { compress } from "../src/compress.ts";

describe("compress async", () => {
    const tempDir = path.join(__dirname, "temp_async");
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    afterAll(() => {
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test("should handle empty input array", async () => {
        const settings: Settings = {
            compressor: noCompress,
            input: [],
            output: [],
        };
        const result = await compress(settings);
        expect(result).toBe("");
    });

    test("should throw error for input array with empty/null values", async () => {
        const settings: Settings = {
            compressor: noCompress,
            input: ["", "file.js"],
            output: ["out1.js", "out2.js"],
        } as any;

        await expect(compress(settings)).rejects.toThrow(
            "Invalid input at index 0: expected non-empty string, got empty string"
        );
    });
});

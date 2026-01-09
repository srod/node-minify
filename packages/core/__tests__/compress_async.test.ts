import fs from "node:fs";
import path from "node:path";
import type { Settings } from "@node-minify/types";
import { afterAll, describe, expect, test, vi } from "vitest";
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

    test("should handle array of image files and read as Buffer", async () => {
        const imageFile1 = path.join(tempDir, "test-image1.png");
        const imageFile2 = path.join(tempDir, "test-image2.png");
        const outputFile1 = path.join(tempDir, "output1.png");
        const outputFile2 = path.join(tempDir, "output2.png");

        fs.writeFileSync(imageFile1, "PNG_IMAGE_DATA_1");
        fs.writeFileSync(imageFile2, "PNG_IMAGE_DATA_2");

        const mockCompressor = vi.fn().mockImplementation(({ content }) => {
            expect(Buffer.isBuffer(content)).toBe(true);
            return Promise.resolve({ code: "", buffer: content });
        });

        const settings: Settings = {
            compressor: mockCompressor,
            input: [imageFile1, imageFile2],
            output: [outputFile1, outputFile2],
        };

        await compress(settings);

        expect(mockCompressor).toHaveBeenCalledTimes(2);

        const allContents = mockCompressor.mock.calls.map(
            (call) => call[0]?.content?.toString() as string
        );
        expect(allContents).toContain("PNG_IMAGE_DATA_1");
        expect(allContents).toContain("PNG_IMAGE_DATA_2");

        for (const call of mockCompressor.mock.calls) {
            expect(Buffer.isBuffer(call[0]?.content)).toBe(true);
        }
    });
});

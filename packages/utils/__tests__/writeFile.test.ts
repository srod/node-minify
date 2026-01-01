import { existsSync, mkdirSync, rmdirSync, unlinkSync } from "node:fs";
import { lstat, writeFile as writeFileNode } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { FileOperationError, ValidationError } from "../src/error.ts";
import { writeFile, writeFileAsync } from "../src/writeFile.ts";

vi.mock("node:fs/promises", async (importOriginal) => {
    const actual = await importOriginal<typeof import("node:fs/promises")>();
    return {
        ...actual,
        lstat: vi.fn(actual.lstat),
        writeFile: vi.fn(actual.writeFile),
    };
});

describe("writeFileAsync", () => {
    const tmpDir = path.join(__dirname, "../../../tests/tmp");
    const testFile = path.join(tmpDir, "write-async-test.js");

    beforeEach(() => {
        if (!existsSync(tmpDir)) {
            mkdirSync(tmpDir, { recursive: true });
        }
    });

    afterEach(() => {
        if (existsSync(testFile)) {
            unlinkSync(testFile);
        }
        vi.clearAllMocks();
    });

    test("should write string content to file", async () => {
        const content = "const foo = 'bar';";
        const result = await writeFileAsync({ file: testFile, content });
        expect(result).toBe(content);
        expect(existsSync(testFile)).toBe(true);
        // We can't use readFile here easily without importing it, but we can rely on node execution or just check existence + mock
        // But better to check content if possible. I'll assume node fs works.
        const written = await import("node:fs").then((fs) =>
            fs.readFileSync(testFile, "utf8")
        );
        expect(written).toBe(content);
    });

    test("should write Buffer content to file", async () => {
        const content = Buffer.from("buffer content");
        const result = await writeFileAsync({ file: testFile, content });
        expect(result).toBe(content);
        const written = await import("node:fs").then((fs) =>
            fs.readFileSync(testFile)
        );
        expect(written.equals(content)).toBe(true);
    });

    test("should support array of files with index", async () => {
        const file1 = path.join(tmpDir, "test1.js");
        const file2 = path.join(tmpDir, "test2.js");
        const content = "content";

        try {
            const result = await writeFileAsync({
                file: [file1, file2],
                content,
                index: 1,
            });
            expect(result).toBe(content);
            expect(existsSync(file2)).toBe(true);
            expect(existsSync(file1)).toBe(false);
        } finally {
            if (existsSync(file1)) unlinkSync(file1);
            if (existsSync(file2)) unlinkSync(file2);
        }
    });

    test("should throw ValidationError if no file provided", async () => {
        await expect(
            writeFileAsync({ file: "", content: "content" })
        ).rejects.toThrow(ValidationError);
        await expect(
            writeFileAsync({ file: "", content: "content" })
        ).rejects.toThrow("No target file provided");
    });

    test("should throw ValidationError if no content provided", async () => {
        await expect(
            writeFileAsync({ file: testFile, content: "" })
        ).rejects.toThrow(ValidationError);
        await expect(
            writeFileAsync({ file: testFile, content: "" })
        ).rejects.toThrow("No content provided");
    });

    test("should throw ValidationError if target file is not a string (invalid index resolution)", async () => {
        await expect(
            writeFileAsync({
                file: [testFile],
                content: "content",
                index: undefined, // logic selects file array instead of string
            } as any)
        ).rejects.toThrow(ValidationError);

        await expect(
            writeFileAsync({
                file: [testFile],
                content: "content",
                index: undefined,
            } as any)
        ).rejects.toThrow("Invalid target file path");
    });

    test("should throw Error if target path exists and is a directory", async () => {
        // Create a directory at testFile path
        if (existsSync(testFile)) unlinkSync(testFile);
        mkdirSync(testFile);

        try {
            await expect(
                writeFileAsync({ file: testFile, content: "content" })
            ).rejects.toThrow("Target path exists and is a directory");
        } finally {
            rmdirSync(testFile);
        }
    });

    test("should rethrow lstat error if not ENOENT", async () => {
        const error = new Error("Permission denied");
        (error as any).code = "EACCES";
        vi.mocked(lstat).mockRejectedValueOnce(error);

        await expect(
            writeFileAsync({ file: testFile, content: "content" })
        ).rejects.toThrow(FileOperationError);
        // writeFileAsync catches error, checks if ValidationError, if not wraps in FileOperationError
    });

    test("should wrap generic errors in FileOperationError", async () => {
        vi.mocked(writeFileNode).mockRejectedValueOnce(
            new Error("Write failed")
        );

        await expect(
            writeFileAsync({ file: testFile, content: "content" })
        ).rejects.toThrow(FileOperationError);
    });

    test("should rethrow ValidationError without wrapping", async () => {
        // We can simulate this by passing invalid args that trigger ValidationError inside try block
        // But validation checks happen before the try/catch block for file/content check?
        // Wait, looking at code:
        /*
        93: export async function writeFileAsync(...) {
        98:     try {
        99:         if (!file) throw new ValidationError...
        ...
        139:     } catch (error) {
        140:         if (error instanceof ValidationError) throw error;
        */
        // Yes, the validation logic is inside the try block.

        await expect(
            writeFileAsync({ file: "", content: "content" })
        ).rejects.toThrow(ValidationError);

        try {
            await writeFileAsync({ file: "", content: "content" });
        } catch (e: any) {
            expect(e).toBeInstanceOf(ValidationError);
            expect(e).not.toBeInstanceOf(FileOperationError);
        }
    });
    test("should handle error with multiple files (branch coverage)", async () => {
        vi.mocked(writeFileNode).mockRejectedValueOnce(new Error("Fail"));

        await expect(
            writeFileAsync({
                file: [testFile],
                content: "content",
                index: 0,
            })
        ).rejects.toThrow(FileOperationError);

        try {
            await writeFileAsync({
                file: [testFile],
                content: "content",
                index: 0,
            });
        } catch (e: any) {
            expect(e.message).toContain("multiple files");
        }
    });

    test("should handle index with non-array file", async () => {
        // When index is provided relative to a single string file, it should just use the file
        // (Implementation detail: index !== undefined ? (isArray ? file[index] : file) : file)
        const file = path.join(tmpDir, "test-index.js");
        const content = "content";
        try {
            const result = await writeFileAsync({
                file,
                content,
                index: 0,
            });
            expect(result).toBe(content);
            expect(existsSync(file)).toBe(true);
        } finally {
            if (existsSync(file)) unlinkSync(file);
        }
    });

    test("should create parent directory if it does not exist (async)", async () => {
        const nestedFile = path.join(tmpDir, "async/nested/dir/file.js");
        const content = "content";
        const result = await writeFileAsync({ file: nestedFile, content });
        expect(result).toBe(content);
        expect(existsSync(nestedFile)).toBe(true);
        // cleanup
        rmdirSync(path.join(tmpDir, "async"), { recursive: true });
    });
});

describe("writeFile (sync)", () => {
    const tmpDir = path.join(__dirname, "../../../tests/tmp");

    beforeEach(() => {
        if (!existsSync(tmpDir)) {
            mkdirSync(tmpDir, { recursive: true });
        }
    });

    test("should create parent directory if it does not exist", () => {
        const nestedFile = path.join(tmpDir, "nested/dir/file.js");
        writeFile({ file: nestedFile, content: "content" });
        expect(existsSync(nestedFile)).toBe(true);
        // cleanup
        rmdirSync(path.join(tmpDir, "nested"), { recursive: true });
    });

    test("should write Buffer content (sync)", async () => {
        const bufferContent = Buffer.from("buffer content sync");
        const outFile = path.join(tmpDir, "sync-buffer.js");
        writeFile({ file: outFile, content: bufferContent });
        // verify
        // We can use node fs to verify
        await import("node:fs").then((fs) => {
            const data = fs.readFileSync(outFile);
            expect(data.equals(bufferContent)).toBe(true);
            unlinkSync(outFile);
        });
    });
});

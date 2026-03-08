/*! node-minify action tests - MIT Licensed */

import { setFailed } from "@actions/core";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { _internal, chunkArray, run } from "../src/index.ts";
import { parseInputs } from "../src/inputs.ts";

vi.mock("@actions/core");
vi.mock("../src/inputs.ts");

describe("chunkArray", () => {
    test("splits array into chunks of specified size", () => {
        const result = chunkArray([1, 2, 3, 4, 5, 6], 2);
        expect(result).toEqual([
            [1, 2],
            [3, 4],
            [5, 6],
        ]);
    });

    test("handles array not evenly divisible by chunk size", () => {
        const result = chunkArray([1, 2, 3, 4, 5], 2);
        expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    test("handles empty array", () => {
        const result = chunkArray([], 3);
        expect(result).toEqual([]);
    });

    test("handles chunk size larger than array", () => {
        const result = chunkArray([1, 2], 5);
        expect(result).toEqual([[1, 2]]);
    });

    test("handles chunk size of 1", () => {
        const result = chunkArray([1, 2, 3], 1);
        expect(result).toEqual([[1], [2], [3]]);
    });

    test("preserves type with generic", () => {
        const result = chunkArray(["a", "b", "c", "d"], 2);
        expect(result).toEqual([
            ["a", "b"],
            ["c", "d"],
        ]);
    });
});

describe("run", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(_internal, "runAutoMode").mockImplementation(async () => {});
        vi.spyOn(_internal, "runExplicitMode").mockImplementation(
            async () => {}
        );
    });

    test("calls runAutoMode when auto is true", async () => {
        vi.mocked(parseInputs).mockReturnValue({ auto: true } as any);
        await run();
        expect(_internal.runAutoMode).toHaveBeenCalledWith({ auto: true });
        expect(_internal.runExplicitMode).not.toHaveBeenCalled();
        expect(setFailed).not.toHaveBeenCalled();
    });

    test("calls runExplicitMode when auto is false", async () => {
        vi.mocked(parseInputs).mockReturnValue({ auto: false } as any);
        await run();
        expect(_internal.runExplicitMode).toHaveBeenCalledWith({ auto: false });
        expect(_internal.runAutoMode).not.toHaveBeenCalled();
        expect(setFailed).not.toHaveBeenCalled();
    });

    test("calls setFailed when parseInputs throws Error", async () => {
        const error = new Error("Parse error");
        vi.mocked(parseInputs).mockImplementation(() => {
            throw error;
        });
        await run();
        expect(setFailed).toHaveBeenCalledWith("Parse error");
    });

    test("calls setFailed with generic message when parseInputs throws unknown error", async () => {
        vi.mocked(parseInputs).mockImplementation(() => {
            throw "Something went wrong";
        });
        await run();
        expect(setFailed).toHaveBeenCalledWith("An unknown error occurred");
    });

    test("calls setFailed when runAutoMode fails", async () => {
        vi.mocked(parseInputs).mockReturnValue({ auto: true } as any);
        const error = new Error("Auto mode failed");
        vi.mocked(_internal.runAutoMode).mockRejectedValue(error);
        await run();
        expect(setFailed).toHaveBeenCalledWith("Auto mode failed");
    });

    test("calls setFailed when runExplicitMode fails", async () => {
        vi.mocked(parseInputs).mockReturnValue({ auto: false } as any);
        const error = new Error("Explicit mode failed");
        vi.mocked(_internal.runExplicitMode).mockRejectedValue(error);
        await run();
        expect(setFailed).toHaveBeenCalledWith("Explicit mode failed");
    });

    test("no error on success (auto mode)", async () => {
        vi.mocked(parseInputs).mockReturnValue({ auto: true } as any);
        vi.mocked(_internal.runAutoMode).mockResolvedValue(undefined);
        await run();
        expect(setFailed).not.toHaveBeenCalled();
    });

    test("no error on success (explicit mode)", async () => {
        vi.mocked(parseInputs).mockReturnValue({ auto: false } as any);
        vi.mocked(_internal.runExplicitMode).mockResolvedValue(undefined);
        await run();
        expect(setFailed).not.toHaveBeenCalled();
    });
});

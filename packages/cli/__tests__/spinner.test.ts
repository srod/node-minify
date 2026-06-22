/*! node-minify spinner tests - MIT Licensed */

import type { Result, Settings } from "@node-minify/types";
import { beforeEach, describe, expect, test, vi } from "vitest";

const oraInstance = vi.hoisted(() => ({
    text: "",
    start: vi.fn(),
    succeed: vi.fn(),
    fail: vi.fn(),
}));

vi.mock("ora", () => ({ default: vi.fn(() => oraInstance) }));

import { spinnerError, spinnerStart, spinnerStop } from "../src/spinner.ts";

beforeEach(() => {
    vi.clearAllMocks();
    oraInstance.text = "";
});

describe("spinner", () => {
    test("spinnerStart sets a compressing message and starts", () => {
        spinnerStart({ compressorLabel: "terser" } as unknown as Settings);
        expect(oraInstance.text).toContain("Compressing file(s)");
        expect(oraInstance.start).toHaveBeenCalled();
    });

    test("spinnerStop sets a success message and succeeds", () => {
        spinnerStop({
            compressorLabel: "terser",
            size: "1 kB",
            sizeGzip: "0.5 kB",
        } as unknown as Result);
        expect(oraInstance.text).toContain("compressed successfully");
        expect(oraInstance.succeed).toHaveBeenCalled();
    });

    test("spinnerError sets a failure message and fails", () => {
        spinnerError({ compressorLabel: "terser" } as unknown as Settings);
        expect(oraInstance.text).toContain("Error - file(s) not compressed");
        expect(oraInstance.text).toContain("terser");
        expect(oraInstance.fail).toHaveBeenCalled();
    });
});

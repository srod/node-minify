/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import childProcess from "node:child_process";
import { EventEmitter } from "node:events";
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    type MockInstance,
    test,
    vi,
} from "vitest";
import { type RunCommandLineParams, runCommandLine } from "../src/index.ts";

describe("Package: run - Timeout", () => {
    let spy: MockInstance;

    beforeAll(() => {
        spy = vi.spyOn(childProcess, "spawn");
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    test("should timeout if process takes too long", async () => {
        const mockChild = new EventEmitter() as any;
        const mockStdin = new EventEmitter();
        const mockStdout = new EventEmitter();
        const mockStderr = new EventEmitter();

        mockChild.kill = vi.fn(); // Mock kill method

        Object.assign(mockChild, {
            stdin: Object.assign(mockStdin, {
                end: vi.fn(),
                write: vi.fn(), // Add write mock for robustness
            }),
            stdout: mockStdout,
            stderr: mockStderr,
        });

        spy.mockReturnValue(mockChild);

        const command = {
            args: ["-jar", "fake.jar"],
            data: "test",
            timeout: 100, // Short timeout
        };

        const promise = runCommandLine(
            command as unknown as RunCommandLineParams
        );

        // Do NOT emit exit event

        await expect(promise).rejects.toThrow("Process timed out");
        expect(mockChild.kill).toHaveBeenCalled();
    });

    test("should not timeout if process completes in time", async () => {
        const mockChild = new EventEmitter() as any;
        const mockStdin = new EventEmitter();
        const mockStdout = new EventEmitter();
        const mockStderr = new EventEmitter();

        mockChild.kill = vi.fn();

        Object.assign(mockChild, {
            stdin: Object.assign(mockStdin, {
                end: vi.fn(),
                write: vi.fn(), // Add write mock for robustness
            }),
            stdout: mockStdout,
            stderr: mockStderr,
        });

        spy.mockReturnValue(mockChild);

        const command = {
            args: ["-jar", "fake.jar"],
            data: "test",
            timeout: 500,
        };

        const promise = runCommandLine(
            command as unknown as RunCommandLineParams
        );

        // Emit exit before timeout
        setTimeout(() => {
            mockChild.emit("exit", 0);
        }, 50);

        await expect(promise).resolves.toBe("");
        expect(mockChild.kill).not.toHaveBeenCalled();
    });
});

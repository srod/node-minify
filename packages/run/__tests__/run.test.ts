/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
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

const jar = `${__dirname}/../../yui/src/binaries/yuicompressor-2.4.7.jar`;

type Command = {
    args: string[];
    data: string;
    maxBuffer?: number;
};

describe("Package: run", () => {
    describe("Base", () => {
        test("should be OK with YUI", async () => {
            const command: Command = {
                args: ["-jar", "-Xss2048k", jar, "--type", "js"],
                data: 'console.log("foo");',
            };

            const result = await runCommandLine(
                command as unknown as RunCommandLineParams
            );
            expect(result).toBeDefined();
        });

        test("should not be OK with YUI, fake arg", async () => {
            const command: Command = {
                args: ["-jar", "-Xss2048k", jar, "--type", "js", "--fake"],
                data: 'console.log("foo");',
            };

            await expect(
                runCommandLine(command as unknown as RunCommandLineParams)
            ).rejects.toThrow();
        });

        test("should handle empty data input", async () => {
            const command: Command = {
                args: ["-jar", "-Xss2048k", jar, "--type", "js"],
                data: "",
            };

            const result = await runCommandLine(
                command as unknown as RunCommandLineParams
            );
            expect(result).toBe("");
        });

        test("should minify JavaScript input", async () => {
            const command: Command = {
                args: ["-jar", "-Xss2048k", jar, "--type", "js"],
                data: 'console.log("foo");',
            };

            const result = await runCommandLine(
                command as unknown as RunCommandLineParams
            );
            expect(result).toBeDefined();
        });
    });

    describe("Process error handling", () => {
        let spy: MockInstance;

        beforeAll(() => {
            spy = vi.spyOn(childProcess, "spawn");
        });

        afterAll(() => {
            vi.restoreAllMocks();
        });

        test("should reject when child process emits error", async () => {
            const mockChild = new EventEmitter() as ReturnType<
                typeof childProcess.spawn
            >;
            const mockStdin = new EventEmitter();
            const mockStdout = new EventEmitter();
            const mockStderr = new EventEmitter();

            Object.assign(mockChild, {
                stdin: Object.assign(mockStdin, {
                    end: vi.fn(),
                }),
                stdout: mockStdout,
                stderr: mockStderr,
                kill: vi.fn(),
            });

            spy.mockReturnValue(mockChild);

            const command: Command = {
                args: ["-jar", "fake.jar"],
                data: "test",
            };

            const promise = runCommandLine(
                command as unknown as RunCommandLineParams
            );

            // Emit process error
            setImmediate(() => {
                mockChild.emit("error", new Error("spawn ENOENT"));
            });

            await expect(promise).rejects.toThrow(
                "Process error: spawn ENOENT"
            );
        });

        test("should handle stream errors gracefully", async () => {
            const consoleSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});

            const mockChild = new EventEmitter() as ReturnType<
                typeof childProcess.spawn
            >;
            const mockStdin = new EventEmitter();
            const mockStdout = new EventEmitter();
            const mockStderr = new EventEmitter();

            Object.assign(mockChild, {
                stdin: Object.assign(mockStdin, {
                    end: vi.fn(),
                }),
                stdout: mockStdout,
                stderr: mockStderr,
                kill: vi.fn(),
            });

            spy.mockReturnValue(mockChild);

            const command: Command = {
                args: ["-jar", "fake.jar"],
                data: "test",
            };

            const promise = runCommandLine(
                command as unknown as RunCommandLineParams
            );

            // Emit stream error and then exit successfully
            setImmediate(() => {
                mockStdin.emit("error", new Error("stdin error"));
                mockStdout.emit("error", new Error("stdout error"));
                mockStderr.emit("error", new Error("stderr error"));
                mockStdout.emit("data", Buffer.from("output"));
                mockChild.emit("exit", 0);
            });

            const result = await promise;
            expect(result).toBe("output");
            expect(consoleSpy).toHaveBeenCalledWith(
                "Error in child.stdin:",
                expect.any(Error)
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                "Error in child.stdout:",
                expect.any(Error)
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                "Error in child.stderr:",
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });

        test("should reject when maxBuffer is exceeded", async () => {
            const mockChild = new EventEmitter() as ReturnType<
                typeof childProcess.spawn
            >;
            const mockStdin = new EventEmitter();
            const mockStdout = new EventEmitter();
            const mockStderr = new EventEmitter();

            Object.assign(mockChild, {
                stdin: Object.assign(mockStdin, {
                    end: vi.fn(),
                }),
                stdout: mockStdout,
                stderr: mockStderr,
                kill: vi.fn(),
            });

            spy.mockReturnValue(mockChild);

            const command: Command = {
                args: ["-jar", "fake.jar"],
                data: "test",
                maxBuffer: 10,
            };

            const promise = runCommandLine(
                command as unknown as RunCommandLineParams
            );

            // Emit data exceeding buffer
            setImmediate(() => {
                mockStdout.emit("data", Buffer.from("12345678901"));
            });

            await expect(promise).rejects.toThrow("stdout maxBuffer exceeded");
            expect(mockChild.kill).toHaveBeenCalled();
        });

        test("should reject when stderr maxBuffer is exceeded", async () => {
            const mockChild = new EventEmitter() as ReturnType<
                typeof childProcess.spawn
            >;
            const mockStdin = new EventEmitter();
            const mockStdout = new EventEmitter();
            const mockStderr = new EventEmitter();

            Object.assign(mockChild, {
                stdin: Object.assign(mockStdin, {
                    end: vi.fn(),
                }),
                stdout: mockStdout,
                stderr: mockStderr,
                kill: vi.fn(),
            });

            spy.mockReturnValue(mockChild);

            const command: Command = {
                args: ["-jar", "fake.jar"],
                data: "test",
                maxBuffer: 10,
            };

            const promise = runCommandLine(
                command as unknown as RunCommandLineParams
            );

            setImmediate(() => {
                mockStderr.emit("data", Buffer.from("12345678901"));
            });

            await expect(promise).rejects.toThrow("stderr maxBuffer exceeded");
            expect(mockChild.kill).toHaveBeenCalled();
        });

        test("should reject when timeout is exceeded", async () => {
            const mockChild = new EventEmitter() as ReturnType<
                typeof childProcess.spawn
            >;
            const mockStdin = new EventEmitter();
            const mockStdout = new EventEmitter();
            const mockStderr = new EventEmitter();

            Object.assign(mockChild, {
                stdin: Object.assign(mockStdin, {
                    end: vi.fn(),
                }),
                stdout: mockStdout,
                stderr: mockStderr,
                kill: vi.fn(),
            });

            spy.mockReturnValue(mockChild);

            const command: Command = {
                args: ["-jar", "fake.jar"],
                data: "test",
                timeout: 100,
            };

            const promise = runCommandLine(
                command as unknown as RunCommandLineParams
            );
            // Suppress unhandled rejection during wait
            promise.catch(() => {});

            // Wait for timeout to trigger
            await new Promise((resolve) => setTimeout(resolve, 150));

            await expect(promise).rejects.toThrow("timeout exceeded");
            expect(mockChild.kill).toHaveBeenCalled();
        });
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });
});

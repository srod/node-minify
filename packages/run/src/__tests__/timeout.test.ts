
import { describe, expect, it, vi } from "vitest";
import { run } from "../index.ts";
import childProcess from "node:child_process";

describe("run with timeout", () => {
    it("should timeout if the process takes too long", async () => {
        // Mock child_process.spawn
        const mockSpawn = vi.spyOn(childProcess, "spawn");

        // Create a mock child process that never ends immediately
        const mockChild: any = {
            on: vi.fn(),
            stdin: {
                on: vi.fn(),
                end: vi.fn(),
            },
            stdout: {
                on: vi.fn(),
            },
            stderr: {
                on: vi.fn(),
            },
            kill: vi.fn(),
        };

        // When spawn is called, return our mock child
        mockSpawn.mockReturnValue(mockChild);

        // We simulate that the 'exit' event is NEVER emitted (or emitted too late)
        // by simply not calling the 'exit' callback in this test synchronous block.

        const runPromise = run({
            data: "some data",
            args: ["-jar", "some.jar"],
            timeout: 100, // Short timeout
        });

        // We expect the promise to reject with a timeout error
        await expect(runPromise).rejects.toThrow("Processing timed out");

        // Expect kill to have been called
        expect(mockChild.kill).toHaveBeenCalled();
    });

    it("should not timeout if the process finishes in time", async () => {
         // Mock child_process.spawn
         const mockSpawn = vi.spyOn(childProcess, "spawn");

         const mockChild: any = {
             on: vi.fn((event, callback) => {
                 if (event === "exit") {
                     // Simulate quick exit
                     setTimeout(() => callback(0), 10);
                 }
             }),
             stdin: {
                 on: vi.fn(),
                 end: vi.fn(),
             },
             stdout: {
                 on: vi.fn(),
                 end: vi.fn(),
             },
             stderr: {
                 on: vi.fn(),
             },
             kill: vi.fn(),
         };

         mockSpawn.mockReturnValue(mockChild);

         await expect(run({
             data: "some data",
             args: ["-jar", "some.jar"],
             timeout: 500, // Longer timeout than exit time
         })).resolves.toBe("");
    });
});

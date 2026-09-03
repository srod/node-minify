/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { afterEach, describe, expect, test, vi } from "vitest";

/**
 * Minimal event-emitter surface used by the fake child process.
 */
interface MinimalEmitter {
    on(event: string, handler: (...args: unknown[]) => void): unknown;
    emit(event: string, ...args: unknown[]): boolean;
}

/**
 * Minimal shape of the fake child process handed to a scenario callback.
 */
interface FakeChild {
    stdout: MinimalEmitter;
    stderr: MinimalEmitter;
    stdin: MinimalEmitter | null;
    kill: () => void;
    emit: (event: string, ...args: unknown[]) => boolean;
}

type RunCallback = (exitCode: number, stdOut: string, stdErr: string) => void;

// Hoisted control surface for the mocked google-closure-compiler module. Each
// test sets `onRun` (what the fake child does once gcc has attached its
// listeners and written stdin) and `stdinEnabled` (whether the child exposes a
// stdin stream, to exercise the "no stdin" branch).
const mock = vi.hoisted(() => ({
    onRun: null as null | ((child: FakeChild, callback: RunCallback) => void),
    stdinEnabled: true,
}));

vi.mock("google-closure-compiler", () => {
    class Emitter {
        private handlers: Record<string, ((...a: unknown[]) => void)[]> = {};
        on(event: string, handler: (...a: unknown[]) => void): this {
            (this.handlers[event] ??= []).push(handler);
            return this;
        }
        emit(event: string, ...args: unknown[]): boolean {
            const hs = this.handlers[event] ?? [];
            for (const h of hs) h(...args);
            return hs.length > 0;
        }
    }

    class FakeStdin extends Emitter {
        write(): void {}
        end(): void {}
    }

    class FakeChildProcess extends Emitter {
        stdout = new Emitter();
        stderr = new Emitter();
        stdin = mock.stdinEnabled ? new FakeStdin() : null;
        kill(): void {}
    }

    class MockCompiler {
        run(callback: RunCallback): FakeChildProcess {
            const child = new FakeChildProcess();
            // Defer until gcc has wired up its listeners + written stdin.
            setImmediate(() => mock.onRun?.(child, callback));
            return child;
        }
    }

    return { default: { compiler: MockCompiler } };
});

import { gcc } from "../src/index.ts";

const baseSettings = { compressor: gcc } as const;

afterEach(() => {
    mock.onRun = null;
    mock.stdinEnabled = true;
});

describe("Package: google-closure-compiler (runCompiler edge paths)", () => {
    test("resolves with the compiler stdout", async () => {
        mock.onRun = (_child, cb) => cb(0, "var a=1;", "");
        const result = await gcc({
            settings: baseSettings,
            content: "var a = 1;",
        });
        expect(result.code).toBe("var a=1;");
    });

    test("resolves with empty output when the compiler emits an empty string", async () => {
        // Empty output is valid (e.g. dead-code elimination); the shared
        // validateMinifyResult / allowEmptyOutput layer decides what to do with it.
        mock.onRun = (_child, cb) => cb(0, "", "");
        const result = await gcc({
            settings: baseSettings,
            content: "var a = 1;",
        });
        expect(result.code).toBe("");
    });

    test("rejects when the compiler returns a non-string result", async () => {
        mock.onRun = (_child, cb) =>
            (cb as (code: number, out: unknown, err: string) => void)(
                0,
                null,
                ""
            );
        await expect(
            gcc({ settings: baseSettings, content: "var a = 1;" })
        ).rejects.toThrow("invalid result");
    });

    test("rejects on a child process 'error' event", async () => {
        mock.onRun = (child) => {
            child.emit("error", new Error("spawn ENOENT"));
        };
        await expect(
            gcc({ settings: baseSettings, content: "var a = 1;" })
        ).rejects.toThrow("process error: spawn ENOENT");
    });

    test("rejects on a stdin 'error' event", async () => {
        mock.onRun = (child) => {
            child.stdin?.emit("error", new Error("EPIPE"));
        };
        await expect(
            gcc({ settings: baseSettings, content: "var a = 1;" })
        ).rejects.toThrow("stdin error: EPIPE");
    });

    test("rejects when stdout exceeds the buffer limit (Buffer chunk)", async () => {
        mock.onRun = (child) => {
            child.stdout.emit("data", Buffer.alloc(64));
        };
        await expect(
            gcc({
                settings: { compressor: gcc, buffer: 8 },
                content: "var a = 1;",
            })
        ).rejects.toThrow("stdout maxBuffer exceeded");
    });

    test("rejects when stdout exceeds the buffer limit (string chunk)", async () => {
        mock.onRun = (child) => {
            child.stdout.emit("data", "x".repeat(64));
        };
        await expect(
            gcc({
                settings: { compressor: gcc, buffer: 8 },
                content: "var a = 1;",
            })
        ).rejects.toThrow("stdout maxBuffer exceeded");
    });

    test("settles only once when multiple errors fire", async () => {
        mock.onRun = (child) => {
            child.emit("error", new Error("first"));
            // The second rejection must be ignored (already settled).
            child.stdin?.emit("error", new Error("second"));
        };
        await expect(
            gcc({ settings: baseSettings, content: "var a = 1;" })
        ).rejects.toThrow("process error: first");
    });

    test("resolves when the child exposes no stdin stream", async () => {
        mock.stdinEnabled = false;
        mock.onRun = (_child, cb) => cb(0, "var b=2;", "");
        const result = await gcc({
            settings: baseSettings,
            content: "var b = 2;",
        });
        expect(result.code).toBe("var b=2;");
    });
});

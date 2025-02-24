/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import childProcess from "node:child_process";
import type { Settings } from "@node-minify/types";

/**
 * Run the command line with spawn.
 * @param args Arguments
 * @param data Data to minify
 * @param settings Settings
 * @param callback Callback
 * @returns Minified content
 */
export type RunCommandLineParams = {
    args: string[];
    data: string;
    settings?: Settings;
    callback?: (err: Error | null, minified?: string) => void;
};

export function runCommandLine({
    args,
    data,
    settings,
    callback,
}: RunCommandLineParams) {
    const runner = settings?.sync ? runSync : runAsync;

    return runner({
        data,
        args,
        callback,
        ...(settings && { settings }),
    });
}

/**
 * Exec command as async.
 * @param data Data to minify
 * @param args Arguments
 * @param callback Callback
 * @returns Minified content
 */
type RunAsyncParams = {
    data: string;
    args: string[];
    callback?: (err: Error | null, minified?: string) => void;
};

function runAsync({ data, args, callback }: RunAsyncParams) {
    let stdout = "";
    let stderr = "";

    const child = childProcess.spawn("java", args, {
        stdio: "pipe",
    });

    const handleError = (source: string) => (error: Error) => {
        console.error(`Error in ${source}:`, error);
    };

    child.on("error", handleError("child"));
    child.stdin?.on("error", handleError("child.stdin"));
    child.stdout?.on("error", handleError("child.stdout"));
    child.stderr?.on("error", handleError("child.stderr"));

    child.on("exit", (code: number | null) => {
        if (code !== 0) {
            return callback?.(
                new Error(stderr || `Process exited with code ${code}`)
            );
        }

        return callback?.(null, stdout);
    });

    child.stdout?.on("data", (chunk: Buffer) => {
        stdout += chunk;
    });
    child.stderr?.on("data", (chunk: Buffer) => {
        stderr += chunk;
    });

    child.stdin?.end(data);
}

/**
 * Exec command as sync.
 *
 * @param settings Settings
 * @param data Data to minify
 * @param args Arguments
 * @param callback Callback
 * @returns Minified content
 */
type RunSyncParams = {
    data: string;
    args: string[];
    settings?: Settings;
    callback?: (err: Error | null, minified?: string) => void;
};

function runSync({ settings, data, args, callback }: RunSyncParams) {
    try {
        const child = childProcess.spawnSync("java", args, {
            input: data,
            stdio: "pipe",
            maxBuffer: settings?.buffer ?? 1000 * 1024, // Default 1MB if not specified
        });
        const stdout = child.stdout?.toString() ?? "";
        const stderr = child.stderr?.toString() ?? "";
        const code = child.status;

        if (code !== 0) {
            return callback?.(
                new Error(stderr || `Process exited with code ${code}`)
            );
        }

        return callback?.(null, stdout);
    } catch (err: unknown) {
        return callback?.(err instanceof Error ? err : new Error(String(err)));
    }
}

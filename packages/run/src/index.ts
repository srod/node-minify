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

export type RunCommandLineParams = {
    args: string[];
    data: string;
    settings?: Settings;
    callback?: (err: Error | null, minified?: string) => void;
};

/**
 * Run the command line with spawn.
 * @param args Arguments
 * @param data Data to minify
 * @param settings Settings
 * @param callback Callback
 * @returns Minified content
 */
export function runCommandLine({
    args,
    data,
    settings,
    callback,
}: RunCommandLineParams) {
    return run({
        data,
        args,
        callback,
        ...(settings && { settings }),
    });
}

type RunParams = {
    data: string;
    args: string[];
    callback?: (err: Error | null, minified?: string) => void;
};

/**
 * Exec command.
 * @param data Data to minify
 * @param args Arguments
 * @param callback Callback
 * @returns Minified content
 */
function run({ data, args, callback }: RunParams) {
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

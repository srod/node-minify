#!/usr/bin/env bun
/*! node-minify - MIT Licensed */

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface PackageJson {
    name: string;
    version: string;
    private?: boolean;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
}

export type CommandResult = { status: number; stdout: string; stderr: string };

/** Runs a command; `inherit` streams its output to this process instead of capturing it. */
export type Run = (
    command: string,
    args: string[],
    options?: { cwd?: string; inherit?: boolean }
) => CommandResult;

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * List package directory names inside the packages directory that contain a package.json file.
 *
 * @param packagesDir - The directory holding the workspace packages
 * @returns A sorted (alphabetical) array of directory names under packagesDir that contain a package.json
 */
function getPackageDirs(packagesDir: string): string[] {
    return readdirSync(packagesDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .filter((entry) =>
            existsSync(join(packagesDir, entry.name, "package.json"))
        )
        .map((entry) => entry.name)
        .sort();
}

/**
 * Read and parse the package.json file for a package located under the packages root.
 *
 * @param packagesDir - The directory holding the workspace packages
 * @param packageDir - The directory name of the package inside packagesDir
 * @returns The parsed package.json as a `PackageJson`
 */
function readPackageJson(packagesDir: string, packageDir: string): PackageJson {
    const pkgPath = join(packagesDir, packageDir, "package.json");
    return JSON.parse(readFileSync(pkgPath, "utf-8"));
}

/**
 * Builds a map from each package's name to its version by reading package.json for all packages.
 *
 * @param packagesDir - The directory holding the workspace packages
 * @returns A Map where each key is a package name and each value is that package's version string.
 */
function buildVersionMap(packagesDir: string): Map<string, string> {
    const versionMap = new Map<string, string>();

    for (const dir of getPackageDirs(packagesDir)) {
        const pkg = readPackageJson(packagesDir, dir);
        versionMap.set(pkg.name, pkg.version);
    }

    return versionMap;
}

/**
 * Replace `workspace:` dependency specifiers with concrete versions from the provided map.
 *
 * Resolves any dependency versions that start with `workspace:` by looking up the package name in `versionMap`. If a package name is not found, throws an error to prevent publishing packages with unresolved workspace references.
 *
 * @param deps - The dependency map to resolve (may be `dependencies`, `devDependencies`, `peerDependencies`, or `optionalDependencies`); may be `undefined`.
 * @param versionMap - A mapping from package name to concrete version string used to replace `workspace:` specifiers.
 * @returns The resolved dependency map with all workspace references replaced, or `undefined` if `deps` was `undefined`.
 * @throws {Error} When a workspace reference cannot be resolved to a concrete version.
 */
function resolveDependencies(
    deps: Record<string, string> | undefined,
    versionMap: Map<string, string>
): Record<string, string> | undefined {
    if (!deps) return deps;

    const resolved: Record<string, string> = {};
    for (const [name, version] of Object.entries(deps)) {
        if (version.startsWith("workspace:")) {
            const actualVersion = versionMap.get(name);
            if (actualVersion) {
                resolved[name] = actualVersion;
            } else {
                throw new Error(
                    `Cannot resolve workspace:* reference for ${name}. Package not found in version map.`
                );
            }
        } else {
            resolved[name] = version;
        }
    }

    return resolved;
}

/**
 * Read an `npm view <name>@<version> version --json` result. Only an exact
 * match counts as published; E404 means not yet; any other failure throws, so
 * a broken registry or auth never reads as "already published".
 *
 * @param version - The version being released
 * @param view - The exit status and output of `npm view`
 * @returns `true` if that exact version is on the registry
 * @throws {Error} When `npm view` fails for any reason other than E404
 */
export function isPublished(version: string, view: CommandResult): boolean {
    if (view.status !== 0) {
        if (errorCode(view.stdout) === "E404") return false;
        const output = `${view.stdout}${view.stderr}`.trim() || "no output";
        throw new Error(`npm view failed (exit ${view.status}): ${output}`);
    }
    if (view.stdout.trim() === "") return false;
    const parsed: unknown = JSON.parse(view.stdout);
    return (Array.isArray(parsed) ? parsed : [parsed]).includes(version);
}

function errorCode(stdout: string): string | undefined {
    try {
        return JSON.parse(stdout)?.error?.code;
    } catch {
        return undefined;
    }
}

const spawnRun: Run = (command, args, options = {}) => {
    const result = spawnSync(command, args, {
        cwd: options.cwd,
        encoding: "utf-8",
        stdio: options.inherit ? "inherit" : "pipe",
        // Only captured lookups time out: a registry that never answers would
        // otherwise hold the job for 6h. Publishes and tagging stream and run long.
        timeout: options.inherit ? undefined : 120_000,
    });
    if (result.error) throw result.error;
    return {
        status: result.status ?? 1,
        stdout: result.stdout ?? "",
        stderr: result.stderr ?? "",
    };
};

function succeed(label: string, result: CommandResult): void {
    if (result.status !== 0) {
        throw new Error(`${label} failed (exit ${result.status})`);
    }
}

/**
 * Publishes every non-private workspace package not already on the registry,
 * then creates changeset tags if anything was published.
 *
 * A version is skipped only when the registry returns that exact version. Any
 * other lookup or publish failure throws, so the release job cannot go green
 * without shipping. Each rewritten package.json is restored after its publish.
 *
 * @param options - `packagesDir` holds the packages, `repoRoot` is where `changeset tag` runs, `run` executes commands
 * @returns The number of packages published
 * @throws {Error} When a lookup, publish, or `changeset tag` fails
 */
export function publishAll(options: {
    packagesDir: string;
    repoRoot: string;
    run: Run;
    log?: (line: string) => void;
}): number {
    const { packagesDir, repoRoot, run, log = console.log } = options;
    const packageDirs = getPackageDirs(packagesDir);
    const versionMap = buildVersionMap(packagesDir);

    log(`Found ${packageDirs.length} packages to publish\n`);

    let published = 0;
    for (const dir of packageDirs) {
        const pkgPath = join(packagesDir, dir, "package.json");
        const originalContent = readFileSync(pkgPath, "utf-8");
        const pkg: PackageJson = JSON.parse(originalContent);

        if (pkg.private) {
            log(`Skipping private package: ${pkg.name}`);
            continue;
        }

        const view = run("npm", [
            "view",
            `${pkg.name}@${pkg.version}`,
            "version",
            "--json",
        ]);
        if (isPublished(pkg.version, view)) {
            log(`Already on npm: ${pkg.name}@${pkg.version}`);
            continue;
        }

        pkg.dependencies = resolveDependencies(pkg.dependencies, versionMap);
        pkg.devDependencies = resolveDependencies(
            pkg.devDependencies,
            versionMap
        );
        pkg.peerDependencies = resolveDependencies(
            pkg.peerDependencies,
            versionMap
        );
        pkg.optionalDependencies = resolveDependencies(
            pkg.optionalDependencies,
            versionMap
        );

        writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

        log(`Publishing ${pkg.name}@${pkg.version}...`);

        try {
            succeed(
                `npm publish ${pkg.name}@${pkg.version}`,
                run("npm", ["publish", "--access", "public", "--provenance"], {
                    cwd: join(packagesDir, dir),
                    inherit: true,
                })
            );
            published++;
            log(`Published ${pkg.name}@${pkg.version}\n`);
        } finally {
            writeFileSync(pkgPath, originalContent);
        }
    }

    // No publish, no tags: changesets/action reads "New tag:" lines as a release.
    if (published === 0) {
        log("\nNothing to publish, no tags created.");
        return 0;
    }

    log("\nCreating git tags...");
    succeed(
        "changeset tag",
        run("changeset", ["tag"], { cwd: repoRoot, inherit: true })
    );

    log("\nDone!");
    return published;
}

if (import.meta.main) {
    try {
        publishAll({
            packagesDir: join(REPO_ROOT, "packages"),
            repoRoot: REPO_ROOT,
            run: spawnRun,
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error("Publish failed:", error.message);
        } else {
            console.error("Publish failed:", error);
        }
        process.exit(1);
    }
}

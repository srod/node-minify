#!/usr/bin/env bun
/*! node-minify - MIT Licensed */

import { execSync } from "node:child_process";
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

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGES_DIR = join(__dirname, "..", "packages");

function getPackageDirs(): string[] {
    return readdirSync(PACKAGES_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .filter((entry) =>
            existsSync(join(PACKAGES_DIR, entry.name, "package.json"))
        )
        .map((entry) => entry.name)
        .sort();
}

function readPackageJson(packageDir: string): PackageJson {
    const pkgPath = join(PACKAGES_DIR, packageDir, "package.json");
    return JSON.parse(readFileSync(pkgPath, "utf-8"));
}

function buildVersionMap(): Map<string, string> {
    const versionMap = new Map<string, string>();

    for (const dir of getPackageDirs()) {
        const pkg = readPackageJson(dir);
        versionMap.set(pkg.name, pkg.version);
    }

    return versionMap;
}

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
                console.warn(
                    `Warning: Could not resolve workspace reference for ${name}`
                );
                resolved[name] = version;
            }
        } else {
            resolved[name] = version;
        }
    }

    return resolved;
}

async function main() {
    const packageDirs = getPackageDirs();
    const versionMap = buildVersionMap();

    console.log(`Found ${packageDirs.length} packages to publish\n`);

    for (const dir of packageDirs) {
        const pkgPath = join(PACKAGES_DIR, dir, "package.json");
        const originalContent = readFileSync(pkgPath, "utf-8");
        const pkg: PackageJson = JSON.parse(originalContent);

        if (pkg.private) {
            console.log(`Skipping private package: ${pkg.name}`);
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

        console.log(`Publishing ${pkg.name}@${pkg.version}...`);

        try {
            execSync("npm publish --access public --provenance", {
                cwd: join(PACKAGES_DIR, dir),
                stdio: "inherit",
            });
            console.log(`Published ${pkg.name}@${pkg.version}\n`);
        } catch {
            console.log(
                `Failed to publish ${pkg.name}@${pkg.version} (may already exist)\n`
            );
        }

        writeFileSync(pkgPath, originalContent);
    }

    console.log("\nCreating git tags...");
    try {
        execSync("changeset tag", { stdio: "inherit" });
    } catch {
        console.log("Failed to create tags (may already exist)");
    }

    console.log("\nDone!");
}

main().catch((error) => {
    console.error("Publish failed:", error);
    process.exit(1);
});

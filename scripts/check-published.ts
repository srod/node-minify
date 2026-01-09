import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const PACKAGES_DIR = "packages";

/**
 * Lists package subdirectories under PACKAGES_DIR that contain a package.json file.
 *
 * @returns An array of directory names for packages that have a package.json in their folder
 */
function getPackageDirs() {
    return readdirSync(PACKAGES_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .filter((entry) =>
            existsSync(join(PACKAGES_DIR, entry.name, "package.json"))
        )
        .map((entry) => entry.name);
}

/**
 * Checks whether an npm package exists on the registry and whether a specific version is published.
 *
 * @param packageName - The npm package name to check (e.g., "lodash")
 * @param version - The package version to check for publication (e.g., "1.2.3")
 * @returns An object with `exists`: `true` if the package is found on the npm registry, `false` otherwise; and `publishedVersion`: `true` if the specified `version` is published, `false` otherwise.
 */
function checkPublished(packageName: string, version: string) {
    // Basic validation to prevent command injection
    if (!/^[\w@/-]+$/.test(packageName) || !/^[\w.-]+$/.test(version)) {
        return { exists: false, publishedVersion: false };
    }

    try {
        const latest = execFileSync(
            "npm",
            ["view", packageName, "version", "--json"],
            {
                stdio: "pipe",
            }
        )
            .toString()
            .trim();
        if (latest === "" || latest === "undefined")
            return { exists: false, publishedVersion: false };

        const specific = execFileSync(
            "npm",
            ["view", `${packageName}@${version}`, "version", "--json"],
            { stdio: "pipe" }
        )
            .toString()
            .trim();
        return {
            exists: true,
            publishedVersion: specific !== "" && specific !== "undefined",
        };
    } catch (_e) {
        return { exists: false, publishedVersion: false };
    }
}

/**
 * Checks all non-private packages under the packages directory and reports their publication status on npm.
 *
 * Scans each package's package.json, queries npm to determine whether the package exists and whether the current
 * package version is published, and prints categorized results to the console:
 * - packages not found on npm (new packages)
 * - packages with unpublished versions (updates needed)
 * - or a confirmation that all packages are up to date
 */
async function main() {
    const dirs = getPackageDirs();
    const results = [];

    console.log("Checking packages...");

    for (const dir of dirs) {
        try {
            const pkgPath = join(PACKAGES_DIR, dir, "package.json");
            const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

            if (pkg.private) continue;

            const status = checkPublished(pkg.name, pkg.version);
            results.push({ name: pkg.name, version: pkg.version, ...status });
        } catch (error) {
            console.warn(
                `Skipping package ${dir}:`,
                error instanceof Error ? error.message : String(error)
            );
            continue;
        }
    }

    const missing = results.filter((r) => !r.exists);
    const versionMismatch = results.filter(
        (r) => r.exists && !r.publishedVersion
    );

    if (missing.length > 0) {
        console.log("\nPackages NOT FOUND on NPM (New packages):");
        for (const p of missing) {
            console.log(`${p.name}@${p.version}`);
        }
    }

    if (versionMismatch.length > 0) {
        console.log("\nPackages with unpublished versions (Update needed):");
        for (const p of versionMismatch) {
            console.log(`${p.name}@${p.version}`);
        }
    }

    if (missing.length === 0 && versionMismatch.length === 0) {
        console.log("\nAll packages are up to date on NPM.");
    }
}

main().catch((err) => {
    if (err instanceof Error) {
        console.error("Error checking packages:", err.message);
        console.error(err.stack);
    } else {
        console.error("An unknown error occurred:", String(err));
    }
    process.exit(1);
});

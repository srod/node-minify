import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const PACKAGES_DIR = "packages";

function getPackageDirs() {
    return readdirSync(PACKAGES_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .filter((entry) =>
            existsSync(join(PACKAGES_DIR, entry.name, "package.json"))
        )
        .map((entry) => entry.name);
}

async function checkPublished(packageName: string, version: string) {
    try {
        const latest = execSync(`npm view ${packageName} version --json`, {
            stdio: "pipe",
        })
            .toString()
            .trim();
        if (latest === "" || latest === "undefined")
            return { exists: false, publishedVersion: false };

        const specific = execSync(
            `npm view ${packageName}@${version} version --json`,
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

async function main() {
    const dirs = getPackageDirs();
    const results = [];

    console.log("Checking packages...");

    for (const dir of dirs) {
        const pkgPath = join(PACKAGES_DIR, dir, "package.json");
        const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

        if (pkg.private) continue;

        const status = await checkPublished(pkg.name, pkg.version);
        results.push({ name: pkg.name, version: pkg.version, ...status });
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
    console.error("Error checking packages:", err);
    process.exit(1);
});

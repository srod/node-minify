import { exec, execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Function to run a command and log the output (synchronous)
const runCommand = (command) => {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: "inherit" });
};

// Function to run a command asynchronously and return a promise
const runCommandAsync = (command) => {
    return new Promise((resolve, reject) => {
        console.log(`Running async: ${command}`);
        const process = exec(command);

        process.stdout.on("data", (data) => {
            console.log(`[${command}] ${data.toString().trim()}`);
        });

        process.stderr.on("data", (data) => {
            console.error(`[${command}] ${data.toString().trim()}`);
        });

        process.on("close", (code) => {
            if (code === 0) {
                console.log(`✅ Completed: ${command}`);
                resolve();
            } else {
                console.error(`❌ Failed with code ${code}: ${command}`);
                reject(
                    new Error(`Command failed with code ${code}: ${command}`)
                );
            }
        });
    });
};

// Build utils and run packages first (these are dependencies for other packages)
console.log("Building core dependencies...");
runCommand('bun --filter "./packages/utils" build');
runCommand('bun --filter "./packages/run" build');

// Build all other packages in parallel
const packages = fs.readdirSync("./packages").filter((file) => {
    const stat = fs.statSync(path.join("./packages", file));
    return (
        stat.isDirectory() &&
        file !== "utils" &&
        file !== "run" &&
        file !== "types"
    );
});

console.log(`Building ${packages.length} packages in parallel...`);

// Create an array of promises for each package build
const buildPromises = packages.map((pkg) => {
    return runCommandAsync(`bun --filter "./packages/${pkg}" build`);
});

// Run all builds in parallel and wait for them to complete
Promise.all(buildPromises)
    .then(() => {
        console.log("✨ All packages built successfully!");
    })
    .catch((error) => {
        console.error("❌ Some packages failed to build:", error.message);
        process.exit(1);
    });

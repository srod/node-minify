import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Function to run a command and log the output
const runCommand = (command) => {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: "inherit" });
};

// Build utils and run packages
runCommand('bun --filter "./packages/utils" build');
runCommand('bun --filter "./packages/run" build');

// Build all other packages
const packages = fs.readdirSync("./packages").filter((file) => {
    const stat = fs.statSync(path.join("./packages", file));
    return (
        stat.isDirectory() &&
        file !== "utils" &&
        file !== "run" &&
        file !== "types"
    );
});

packages.forEach((pkg) => {
    runCommand(`bun --filter "./packages/${pkg}" build`);
});

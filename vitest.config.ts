import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        reporters: "dot",
        coverage: {
            reporter: ["text", "json", "html"],
            exclude: [
                "**/dist/**",
                "**/node_modules/**",
                "**/__tests__/**",
                "**/tests/**",
                "**/*.config.ts",
                "**/types/**",
            ],
        },
        testTimeout: 240000,
    },
});

import { defineConfig } from "tsdown";

export default defineConfig({
    format: ["esm"],
    dts: { eager: true },
    clean: true,
    sourcemap: true,
    outExtensions({ format }) {
        if (format === "es") return { js: ".js", dts: ".d.ts" };
    },
});

import partytown from "@astrojs/partytown";
import preact from "@astrojs/preact";
import { defineConfig } from "astro/config";

export default defineConfig({
    integrations: [
        partytown(),
        // Enable Preact to support Preact JSX components.
        preact(),
    ],
    site: "https://node-minify.2clics.net",
});

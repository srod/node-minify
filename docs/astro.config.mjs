import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// https://astro.build/config
import partytown from '@astrojs/partytown';

// https://astro.build/config
// import libAnalytics from "@astrolib/analytics";

// https://astro.build/config
export default defineConfig({
  integrations: [
    // Enable Preact to support Preact JSX components.
    preact(),
    partytown()
    /* , libAnalytics() */
  ],
  site: `https://node-minify.2clics.net`
});

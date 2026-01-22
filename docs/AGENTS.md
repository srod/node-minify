# docs/AGENTS.md

Astro documentation site for node-minify. **Separate from main monorepo build.**

## Commands
```bash
bun run dev      # Local dev server at localhost:4321
bun run build    # Production build to ./dist/
bun run preview  # Preview production build
```

## Structure
```
docs/
├── src/
│   ├── content/docs/   # Markdown content (compressors/, guides/)
│   ├── components/     # Astro/React components
│   ├── layouts/        # Page layouts
│   └── styles/         # CSS (theme.css)
├── public/             # Static assets, JS utilities
└── astro.config.mjs    # Astro configuration
```

## Content
- **Add page**: Create `.md` in `src/content/docs/{section}/`
- **Sidebar**: Edit `src/consts.ts` → `SIDEBAR` object
- **Frontmatter**: `title`, `description`, `layout` (optional)

## Code Style
- **Components**: `.astro` for static, `.tsx` for interactive
- **Biome overrides**: Relaxed rules for `.astro` files (unused imports allowed)
- **CSS**: Use variables from `src/styles/theme.css`

## Deploy
Cloudflare Pages auto-deploys on push to `main`/`develop`. Headers in `public/_headers`.

## Key Files
| File | Purpose |
|------|---------|
| `src/consts.ts` | Site config, sidebar navigation |
| `public/make-scrollable-code-focusable.js` | A11y for code blocks |
| `public/copy-code.js` | Copy button for code blocks |
| `public/_headers` | CSP, HSTS security headers |

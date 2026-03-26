# Rebranding Plan: `@node-minify` → `@mnfy`

## 🎯 Goal
Transition the project from **`@node-minify/*`** to the new, premium scope **`@mnfy/*`**.

**Why?**
- **Runtime Agnostic**: "Node" is no longer the only runtime. We support Bun, Deno, and others. `@mnfy` reflects this universal nature.
- **Modern Identity**: Short, memorable, and professional (4-letter scope).
- **Clean Slate**: Opportunity to standardize naming conventions.

## 📅 Proposed Timeline

### Phase 1: Preparation (Feature Freeze)
- [ ] **Audit**: List all packages to be renamed.
- [ ] **Naming Convention**: Decide on package mappings (see below).
- [ ] **Repo Structure**: Update `packages/` folder names to match new scope (optional but recommended).
- [ ] **Internal Dependencies**: Update all `package.json` files to reference `@mnfy/*` versions via `workspace:*`.

### Phase 2: Implementation
- [ ] **Rename**: Update `name` field in all `package.json` files.
- [ ] **Imports**: Global find/replace of `@node-minify/` to `@mnfy/` in source code.
- [ ] **Config**: Update `tsdown.config.ts`, `vitest.config.ts`, and `changesets` config.
- [ ] **CI/CD**: Ensure publishing tokens have access to the `@mnfy` organization.

### Phase 3: Launch & Migration
- [ ] **Release**: Publish `v1.0.0` (or `v11.0.0`) of `@mnfy/*` packages.
- [ ] **Legacy Support**:
    - Create "wrapper" packages for `@node-minify/*`.
    - These wrappers should simply import and re-export the `@mnfy/*` equivalent.
    - Add a `postinstall` script or `console.warn` to the wrappers: *"@node-minify is deprecated. Please switch to @mnfy."*
- [ ] **Docs**: Update website and READMEs to reflect the new identity.

## 📦 Package Mapping

| Current Name | New Name | Notes |
| :--- | :--- | :--- |
| `@node-minify/core` | **`@mnfy/core`** | The heart of the library |
| `@node-minify/cli` | **`@mnfy/cli`** | The command line tool |
| `@node-minify/utils` | **`@mnfy/utils`** | Shared helpers |
| `@node-minify/terser` | **`@mnfy/terser`** | |
| `@node-minify/esbuild` | **`@mnfy/esbuild`** | |
| `@node-minify/minify-html` | **`@mnfy/html`** | *Simplified name* |
| `@node-minify/google-closure-compiler` | **`@mnfy/gcc`** | *Simplified name* |
| `@node-minify/benchmark` | **`@mnfy/bench`** | *Simplified name (optional)* |

## 🚀 New Product: GitHub Action

> ✅ **COMPLETED** - Published as `srod/node-minify@v1`
> See [packages/action/README.md](packages/action/README.md) for documentation.

- [x] Runs compression on pull requests automatically.
- [x] Reports compression stats (size savings, build time) as a PR comment.
- [x] Base branch comparison (shows size changes vs main/develop).
- [x] Benchmark mode to compare compressor performance.
- [x] Threshold enforcement (fail on size increase or min reduction).
- [x] Zero-config mode (auto-discover files) - see `ZERO_CONFIG_PLAN.md`.

## 📣 Announcement Draft
> **node-minify is now @mnfy**
>
> We are evolving! To reflect our support for Bun, Deno, and modern web tools, we have moved to a new home.
> - Same great tools, faster name.
> - `npm install @mnfy/core`
> - `npm install @mnfy/terser`
>
> The `@node-minify` packages will continue to work but are now deprecated.

## 💡 Feature Roadmap

### 1. Smart Mode (`--auto`)
Automatically select the best compressor based on file type and environment.
- Detects `.css` → uses `lightningcss` (fastest Rust-based).
- Detects `.html` → uses `@mnfy/html`.
- **Goal**: `mnfy src/` just works without config.

### 2. Performance Budgeting
Define size limits in `package.json` or `.mnfyrc`.
- CI fails if minified output exceeds budget (e.g., "bundle < 50kB gzipped").
- Critical for teams monitoring Core Web Vitals.

### 3. Differential Serving
Produce two builds automatically:
- Modern (`es2020+`) for 90% of traffic.
- Legacy for older browsers.
- Orchestrated seamlessly by CLI.

### 4. Watch Mode
Dedicated `mnfy --watch` that only re-minifies changed files for instant feedback during development.

### 5. Visual Analytics
Generate a static HTML report (similar to `webpack-bundle-analyzer`) showing:
- Where the bytes are coming from.
- Gzip/Brotli savings.
- Historical trends (via the GitHub Action).

## 🔮 Extended Feature Roadmap

The following features represent longer-term opportunities to expand `@mnfy` into a comprehensive compression toolkit.

### 6. Integrations & Ecosystem

| Package | Description |
| :--- | :--- |
| `@mnfy/vite` | Official Vite plugin for seamless integration |
| `@mnfy/rollup` | Rollup plugin with full options passthrough |
| `@mnfy/unplugin` | Universal plugin (Vite/Rollup/Webpack/esbuild) |
| `@mnfy/vscode` | VS Code extension with real-time size hints and gutter annotations |
| `@mnfy/eslint-plugin` | Lint rules to detect unminifiable patterns (e.g., dynamic property access) |

- **Native Runtime Support**: First-class `deno task mnfy` and `bunx mnfy` with zero npm install required.

### 7. Developer Experience (DX)

- **Config File Support**: `.mnfyrc`, `.mnfyrc.json`, or `mnfy.config.ts` for project-level defaults.
- **Preset System**: `--preset=web`, `--preset=library`, `--preset=aggressive`, `--preset=compat` for common use cases.
- **Interactive Init**: `mnfy init` wizard to scaffold config, detect file types, and recommend compressors.
- **Dry Run Mode**: `--dry-run` shows size predictions without writing files.
- **Diff Output**: `--diff` displays a colorized diff between original and minified code.

### 8. Advanced Compression

- **Cascade Compression**: Chain compressors in a single pipeline (e.g., TypeScript → terser → gzip).
- **Adaptive Selection**: Auto-select the best compressor per-file based on content analysis and size/speed tradeoffs.
- **WASM Minification**: Support for `.wasm` file optimization via `wasm-opt` (Binaryen).
- **JSON5/JSONC Support**: Minify JSON files with comments (common in config files).
- **GraphQL Minification**: Minify `.graphql` and `.gql` schema/query files.

### 9. Performance & Analytics

- **Per-File Budgets**: Define max sizes per glob pattern; fail CI if any file exceeds its budget.
- **Historical Tracking**: Store compression stats over time (JSON or SQLite) for trend analysis.
- **Cost Estimation**: Show estimated CDN/bandwidth cost savings based on traffic assumptions.
- **Treemap Visualization**: Flamegraph-style output showing where bytes come from in the bundle.

### 10. CI/CD & Automation

- **PR Size Bot**: Extend GitHub Action to post size comparison tables as PR comments with branch history.
- **Notifications**: Slack/Discord webhooks when size budgets are exceeded.
- **Monorepo Support**: `mnfy workspace` command for Turborepo/Nx/pnpm workspaces.
- **Caching Layer**: Content-addressable cache for incremental builds (local + remote via S3/R2).

### 11. Security & Compliance

- **License Preservation**: Option to keep copyright/license headers in minified output.
- **Source Map Privacy**: Strip or anonymize file paths in source maps for production deployments.
- **Dependency Audit**: Flag if a compressor package has known vulnerabilities.

### 12. New Compressor Backends

| Compressor | Type | Notes |
| :--- | :--- | :--- |
| **Rolldown** | JS | Rust-based, emerging Rollup replacement |
| **Biome** | JS/CSS | All-in-one Rust toolchain (formatter + linter + minifier) |
| **tdewolff/minify** | HTML/CSS/JS/JSON/XML | Go-based, extremely fast |
| **wasm-opt** | WASM | Binaryen optimizer for WebAssembly binaries |

### 13. Output Formats & Delivery

- **Pre-Compressed Assets**: Generate `.gz` and `.br` files alongside minified output for CDN pre-compressed serving.
- **Edge-Optimized Output**: Formats tailored for Cloudflare Workers, Vercel Edge Functions, Deno Deploy.
- **Critical CSS Extraction**: Extract and inline above-the-fold CSS for faster first paint.
- **Module/NoModule**: Automatic ES5 fallback generation (expansion of Differential Serving).

### 14. OXC Ecosystem Expansion

Leverage the [OXC (Oxidation Compiler)](https://github.com/oxc-project) ecosystem for next-generation Rust-based tooling. OXC offers a suite of high-performance tools that are 3-5x faster than alternatives.

#### Current Integration
- `@mnfy/oxc` — JavaScript minifier via `oxc-minify` ✅

#### New Packages

| Package | Based On | Purpose |
| :--- | :--- | :--- |
| `@mnfy/oxc-transform` | `oxc-transform` | TypeScript/JSX transpilation before minification |
| `@mnfy/oxc-resolver` | `oxc-resolver` | Smart file discovery via module graph analysis |

#### Feature Enhancements

- **Cascade Pipelines**: Chain `oxc-transform → oxc-minify` for TypeScript projects in a single pass.
- **Differential Serving via OXC**: Use `oxc-transform` with `target: "es2020"` or `target: "es5"` for modern/legacy builds.
- **Source Map Support**: Return proper source maps from OXC minifier (currently returns `undefined`).
- **Advanced Mangle Options**: Expose OXC's granular controls:
  - `mangle.topLevel` — Mangle top-level variable names
  - `mangle.keepClassNames` — Preserve class names for debugging
  - `mangle.keepFnNames` — Preserve function names for stack traces
- **Module Graph Analysis**: Use `oxc-resolver` to power Smart Mode (`--auto`) by automatically discovering all files to minify from entry points.

#### Benchmark Alignment

Adopt OXC's benchmark methodology from [`bench-javascript-parser-written-in-rust`](https://github.com/oxc-project/bench-javascript-parser-written-in-rust):
- Compare compression ratio AND speed across all compressors.
- Generate reproducible, CI-friendly benchmark reports.
- Track performance regressions over time.

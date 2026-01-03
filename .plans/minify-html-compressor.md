# Plan: Add @minify-html/node Compressor

## Objective

Add a new HTML compressor package `@node-minify/minify-html` that wraps the `@minify-html/node` library - a high-performance Rust-based HTML minifier.

---

## Status: PENDING

---

## Background

### Why Add This Compressor?

| Aspect | `html-minifier` (current) | `@minify-html/node` (new) |
|--------|---------------------------|---------------------------|
| **Backend** | JavaScript | Rust (via Neon bindings) |
| **Speed** | Good | ~10x faster |
| **JS minification** | Uses terser | Uses oxc |
| **CSS minification** | Uses clean-css | Uses lightningcss |
| **Maintenance** | html-minifier-next fork | Actively maintained |
| **Template syntax** | Limited | Jinja, EJS, ERB, Handlebars, etc. |

### Package Details

| Attribute | Value |
|-----------|-------|
| **npm package** | `@minify-html/node` |
| **Author** | Wilson Lin (wilsonzlin) |
| **Repository** | https://github.com/wilsonzlin/minify-html |
| **Version** | 0.16.4+ |
| **License** | MIT |

### API Overview

```typescript
import minifyHtml from "@minify-html/node";

// Input: Buffer, Output: Buffer
const minified = minifyHtml.minify(Buffer.from(htmlString), {
    minify_css: true,
    minify_js: true,
    // ... other options
});

const result = minified.toString();
```

**Key difference**: The library uses `Buffer` for both input and output, not strings.

---

## Implementation Steps

### 1. Create Package Structure

Create `packages/minify-html/` with standard structure:

```
packages/minify-html/
├── src/
│   └── index.ts           # Main compressor implementation
├── __tests__/
│   └── minify-html.test.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── LICENSE
└── README.md
```

### 2. Implement Compressor (`src/index.ts`)

```typescript
/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";

/**
 * Default options for minify-html.
 * Note: All options in @minify-html/node default to false,
 * so we enable the most useful ones by default.
 */
const defaultOptions = {
    minify_css: true,
    minify_js: true,
};

/**
 * Minifies HTML content using @minify-html/node (Rust-based).
 *
 * @param settings - Minifier settings; `settings.options` are merged with defaults.
 * @param content - The HTML content to minify.
 * @returns An object containing the minified HTML as `code`.
 */
export async function minifyHtml({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "minify-html");

    const minifyHtmlLib = await import("@minify-html/node");
    const options = { ...defaultOptions, ...settings?.options };

    const inputBuffer = Buffer.from(contentStr);
    const outputBuffer = minifyHtmlLib.minify(inputBuffer, options);
    const code = outputBuffer.toString();

    return { code };
}
```

### 3. Create Package Configuration

#### `package.json`

```json
{
  "name": "@node-minify/minify-html",
  "version": "10.2.0",
  "description": "minify-html plugin for @node-minify (Rust-based HTML minifier)",
  "keywords": [
    "compressor",
    "minify",
    "minifier",
    "minify-html",
    "html",
    "rust"
  ],
  "author": "Rodolphe Stoclin <srodolphe@gmail.com>",
  "homepage": "https://github.com/srod/node-minify/tree/main/packages/minify-html#readme",
  "license": "MIT",
  "type": "module",
  "engines": {
    "node": ">=20.0.0"
  },
  "directories": {
    "lib": "dist",
    "test": "__tests__"
  },
  "types": "./dist/index.d.ts",
  "main": "./dist/index.js",
  "exports": {
    "types": "./dist/index.d.ts",
    "default": "./dist/index.js"
  },
  "sideEffects": false,
  "files": [
    "dist/**/*"
  ],
  "publishConfig": {
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/srod/node-minify.git"
  },
  "bugs": {
    "url": "https://github.com/srod/node-minify/issues"
  },
  "scripts": {
    "build": "tsdown src/index.ts",
    "check-exports": "attw --pack . --profile esm-only",
    "format:check": "biome check .",
    "lint": "biome lint .",
    "prepublishOnly": "bun run build",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "dev": "tsdown src/index.ts --watch"
  },
  "dependencies": {
    "@node-minify/utils": "workspace:*",
    "@minify-html/node": "^0.16.4"
  },
  "devDependencies": {
    "@node-minify/types": "workspace:*"
  }
}
```

#### `tsconfig.json`

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

#### `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
    },
});
```

### 4. Create Tests (`__tests__/minify-html.test.ts`)

```typescript
/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from "vitest";
import { runOneTest, tests } from "../../../tests/fixtures.ts";
import { minifyHtml } from "../src/index.ts";

const compressorLabel = "minify-html";
const compressor = minifyHtml;

describe("Package: minify-html", async () => {
    if (!tests.commonhtml) {
        throw new Error("Tests not found");
    }

    // Run commonhtml tests
    for (const options of tests.commonhtml) {
        await runOneTest({ options, compressorLabel, compressor });
    }
});
```

### 5. Register in CLI

Update `packages/cli/src/config.ts`:

```typescript
export const AVAILABLE_MINIFIER = [
    // ... existing entries
    "@node-minify/minify-html",
];
```

### 6. Register in Benchmark

Update `packages/benchmark/src/compressor-loader.ts`:

```typescript
export const COMPRESSOR_EXPORTS: Record<string, string> = {
    // ... existing entries
    "@node-minify/minify-html": "minifyHtml",
};
```

### 7. Update Documentation

#### Add to main README.md

Under **HTML:**:
```markdown
- [minify-html](https://node-minify.2clics.net/compressors/minify-html) - Rust-based, fastest
- [html-minifier](https://node-minify.2clics.net/compressors/html-minifier)
```

#### Create docs page `docs/src/content/docs/compressors/minify-html.md`

```markdown
---
title: minify-html
---

# minify-html

`@node-minify/minify-html` wraps [@minify-html/node](https://github.com/wilsonzlin/minify-html), a high-performance Rust-based HTML minifier.

## Features

- **Very fast**: Written in Rust, ~10x faster than JavaScript alternatives
- **Smart minification**: Context-aware whitespace handling
- **Inline CSS/JS**: Uses lightningcss and oxc for embedded code
- **Template support**: Preserves Jinja, EJS, ERB, Handlebars syntax

## Installation

\`\`\`bash
npm install @node-minify/core @node-minify/minify-html
\`\`\`

## Usage

\`\`\`js
import { minify } from '@node-minify/core';
import { minifyHtml } from '@node-minify/minify-html';

await minify({
  compressor: minifyHtml,
  input: 'src/*.html',
  output: 'dist/$1.html'
});
\`\`\`

## Options

All options from [@minify-html/node](https://docs.rs/minify-html/latest/minify_html/struct.Cfg.html) are supported via `options`.

### Defaults

| Option | Default | Description |
|--------|---------|-------------|
| `minify_css` | `true` | Minify inline CSS |
| `minify_js` | `true` | Minify inline JavaScript |

### Example with Options

\`\`\`js
await minify({
  compressor: minifyHtml,
  input: 'src/*.html',
  output: 'dist/$1.html',
  options: {
    minify_css: true,
    minify_js: true,
    keep_comments: true,
    keep_closing_tags: true,
    preserve_brace_template_syntax: true, // For Jinja/Nunjucks
  }
});
\`\`\`

### Available Options

| Option | Description |
|--------|-------------|
| `minify_css` | Minify CSS in `<style>` tags and `style` attributes |
| `minify_js` | Minify JavaScript in `<script>` tags |
| `keep_comments` | Preserve HTML comments |
| `keep_closing_tags` | Keep optional closing tags (e.g., `</li>`, `</p>`) |
| `keep_html_and_head_opening_tags` | Keep `<html>` and `<head>` tags |
| `keep_ssi_comments` | Keep Server Side Include comments |
| `preserve_brace_template_syntax` | Preserve `{{ }}`, `{% %}`, `{# #}` |
| `preserve_chevron_percent_template_syntax` | Preserve `<% %>` |
| `remove_bangs` | Remove `<! >` declarations |
| `remove_processing_instructions` | Remove `<? ?>` instructions |
\`\`\`
```

---

## Configuration Options Reference

All options default to `false` in the underlying library. Our wrapper enables sensible defaults.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minify_css` | boolean | `true` | Minify inline CSS using lightningcss |
| `minify_js` | boolean | `true` | Minify inline JS using oxc |
| `keep_comments` | boolean | `false` | Preserve HTML comments |
| `keep_closing_tags` | boolean | `false` | Keep optional closing tags |
| `keep_html_and_head_opening_tags` | boolean | `false` | Keep html/head opening tags |
| `keep_ssi_comments` | boolean | `false` | Keep SSI comments |
| `preserve_brace_template_syntax` | boolean | `false` | Keep `{{`, `{%`, `{#` |
| `preserve_chevron_percent_template_syntax` | boolean | `false` | Keep `<% %>` |
| `remove_bangs` | boolean | `false` | Remove bang declarations |
| `remove_processing_instructions` | boolean | `false` | Remove processing instructions |
| `minify_doctype` | boolean | `false` | Minify DOCTYPE (non-compliant) |
| `allow_optimal_entities` | boolean | `false` | Use shorter entities |
| `allow_removing_spaces_between_attributes` | boolean | `false` | Remove attribute spaces |

---

## Verification Checklist

- [ ] Package compiles without errors (`bun run build`)
- [ ] All `commonhtml` tests pass (`bun run test packages/minify-html`)
- [ ] TypeScript types are correct (`bun run typecheck`)
- [ ] Linting passes (`bun run lint`)
- [ ] CLI can use the compressor (`bunx @node-minify/cli -c @node-minify/minify-html -i test.html -o out.html`)
- [ ] Benchmark can load the compressor
- [ ] Documentation renders correctly

---

## Rollout

1. Implement package
2. Run full test suite
3. Add changeset: `bun run changeset`
4. Update documentation
5. PR review
6. Publish with other packages

---

## Notes

- The package name `@node-minify/minify-html` distinguishes it from `@node-minify/html-minifier`
- Users can choose based on preference (speed vs familiarity)
- Both compressors will remain available - no deprecation planned

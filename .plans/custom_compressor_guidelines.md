# Plan: Custom & Contributed Compressor Guidelines

## Objective
Enable developers to create their own compressors for `node-minify`. This covers two use cases:
1.  **External Plugins**: Developers creating standalone packages or local functions for their own projects.
2.  **Official Contributions**: Developers adding a new compressor to the `node-minify` monorepo.

---

## Status: PARTIALLY IMPLEMENTED

### Completed
- [x] Documentation created at `docs/src/content/docs/custom-compressors.md`
- [x] Sidebar updated in `docs/src/consts.ts` (line 12)
- [x] Compressor interface documented with TypeScript types
- [x] Minimal example with inline compressor
- [x] Handling options example
- [x] Contributing to Core section (package structure, CLI registration, Benchmark registration, testing)

### Remaining Items
- [ ] **CLI limitation note**: Add explicit note that custom compressors cannot be used with CLI (only programmatic API) - see `custom_compressor_cli_support.md` for future enhancement
- [ ] **Binary content support**: Add note that compressors can handle `Buffer` content (for image compressors like `sharp`, `imagemin`)
- [ ] **Source map support**: Document that compressors can optionally return `map` field
- [ ] **CONTRIBUTING.md**: Consider adding/linking compressor contribution guide in root `CONTRIBUTING.md`

---

## 1. External Plugins (Library Mode)
*Context: You are a user who wants to use a custom tool with `node-minify`.*

**Concept:**
The `minify()` function accepts a `Compressor` function. You do **not** need to register your compressor in any static lists (`AVAILABLE_MINIFIER`, etc.). Those lists are only for the CLI and Benchmark tools.

**Action Items:**
*   ~~Create `docs/src/content/docs/custom-compressors.md`.~~ DONE
*   **Guide Content**:
    *   ~~**The Compressor Interface**: Explain `MinifierOptions` and `CompressorResult`.~~ DONE
    *   ~~**Example**: Writing a simple in-memory replacement compressor.~~ DONE
    *   ~~**Usage**: Passing the function directly to `minify({ compressor: myFunc })`.~~ DONE
    *   **Note on CLI**: Explicitly state that custom compressors cannot be used with the standard CLI currently. **TODO** - add to docs

## 2. Official Contributions (Core Integration)
*Context: You are contributing a new compressor package (e.g., `@node-minify/new-tool`) to the repository.*

**Concept:**
To expose a new compressor via the CLI and Benchmark tools, it must be registered in the static configuration files.

**Action Items:**
*   ~~Add a "Contributing a Compressor" section to the docs.~~ DONE (in custom-compressors.md)
*   Consider also adding to a separate internal guide `CONTRIBUTING.md` **TODO**
*   **Checklist for New Compressors**: (All documented in custom-compressors.md)
    1.  ~~**Package Creation**: Create `packages/<name>` with standard structure.~~ DONE
    2.  ~~**CLI Registration**: Update `packages/cli/src/config.ts`: Add to `AVAILABLE_MINIFIER` array.~~ DONE
    3.  ~~**Benchmark Registration**: Update `packages/benchmark/src/compressor-loader.ts`: Add to `COMPRESSOR_EXPORTS`.~~ DONE
    4.  ~~**Tests**: Add tests using shared helpers.~~ DONE

## Implementation Steps

### Documentation
1.  ~~**Create** `docs/src/content/docs/custom-compressors.md`~~ DONE
2.  ~~**Update** `docs/src/consts.ts`: Add "Custom Compressors" to the sidebar.~~ DONE

## Verification
*   ~~Verify that `AVAILABLE_MINIFIER` and `COMPRESSOR_EXPORTS` are the only two registry files.~~ Confirmed: Yes
*   Note: `tests/fixtures.ts` does not have a static list of compressors - tests are defined per-package

---

## Suggested Additions to Existing Docs

### 1. Add CLI Limitation Note (to custom-compressors.md)
Under "Creating a Local Compressor" section, add:
```markdown
> **Note**: Custom compressors can only be used with the programmatic API (`minify()`).
> The CLI currently only supports built-in compressors. See the [CLI Support Plan](./custom_compressor_cli_support.md)
> for a future enhancement that will enable `node-minify --compressor ./my-compressor.js`.
```

### 2. Add Binary Content Note
```markdown
### Binary Content (Images)

For image compressors, the `content` parameter may be a `Buffer` instead of a string.
Your compressor should return `buffer` in the result for binary output:

\`\`\`typescript
export const myImageCompressor: Compressor = async ({ content }) => {
  const buffer = content as Buffer;
  const optimized = await processImage(buffer);
  return { code: "", buffer: optimized };
};
\`\`\`
```

### 3. Add Source Map Note
```markdown
### Source Maps

Compressors can optionally return source maps:

\`\`\`typescript
return {
  code: minifiedCode,
  map: sourceMapString  // Optional
};
\`\`\`
```

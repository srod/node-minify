# Integration Tests - Future Ideas

## Overview

This document captures ideas for expanding integration test coverage beyond the initial 79 tests implemented in Phase 1-5.

---

## High Value Ideas

| Idea | Description | Effort | Impact |
|------|-------------|--------|--------|
| **Cross-platform path tests** | Test Windows backslashes, UNC paths, drive letters. Currently only tested on macOS/Linux. | Medium | High |
| **Memory usage baseline** | Ensure large file processing doesn't leak memory. Track heap usage before/after. | Medium | High |
| **Compression ratio validation** | Assert minimum compression % for known inputs (e.g., terser should compress sample.js by at least 30%). | Low | High |

---

## Medium Value Ideas

| Idea | Description | Effort | Impact |
|------|-------------|--------|--------|
| **Deprecated compressor smoke tests** | Minimal tests for yui, babel-minify, uglify-es, crass, sqwish to catch breakage. | Low | Medium |
| **Unicode content handling** | Test emoji, CJK characters, RTL text in JS/CSS/HTML files. | Low | Medium |
| **Symlink handling** | Verify symlinks resolve correctly, avoid infinite loops with circular symlinks. | Low | Medium |
| **Streaming/stdin input** | Test piping content via CLI stdin: `echo "code" \| node-minify -c terser`. | Medium | Medium |
| **Config file loading** | If `.node-minify.config.js` is ever supported, test config discovery. | Medium | Medium |
| **Watch mode simulation** | Test file change detection if `--watch` is ever added. | High | Medium |

---

## Lower Priority Ideas

| Idea | Description | Effort | Impact |
|------|-------------|--------|--------|
| **Snapshot testing** | Compare minified output against known-good snapshots for regression detection. | Medium | Low |
| **Benchmark suite** | Track performance regression across compressors over time. | High | Low |
| **Docker container test** | Ensure everything works in containerized CI environments. | Medium | Low |
| **ESM/CJS interop** | Test both `import` and `require()` styles work correctly. | Low | Low |
| **Network timeout handling** | For compressors that fetch remote resources (if any). | Low | Low |

---

## Quick Wins (Recommended Next)

These can be implemented quickly with high value:

### 1. Unicode Content Tests
- JS with emoji in strings: `const msg = "Hello 👋 World";`
- CSS with unicode selectors: `.日本語 { color: red; }`
- HTML with CJK content
- JSON with unicode keys/values

### 2. Compression Ratio Assertions
- Define expected minimum compression for sample files
- Fail if compression ratio drops below threshold
- Catches accidental regressions in compressor configs

### 3. Deprecated Compressor Smoke Tests
- One basic test per deprecated compressor
- Just verify they still load and run
- Skip on CI if dependencies unavailable

---

## Implementation Notes

### Test File Locations
```
tests/integration/
├── cli.integration.test.ts          # ✅ Done (18 tests)
├── workflow.integration.test.ts     # ✅ Done (15 tests)
├── error-scenarios.integration.test.ts  # ✅ Done (25 tests)
├── image.integration.test.ts        # ✅ Done (21 tests)
├── unicode.integration.test.ts      # 🆕 Planned
├── compression-ratio.integration.test.ts  # 🆕 Planned
└── deprecated.integration.test.ts   # 🆕 Planned
```

### Fixture Requirements
- Need test images: PNG, JPEG, SVG (can use existing in `examples/public/images/`)
- Need unicode fixture files (create in `tests/fixtures/unicode/`)

### CI Considerations
- Image tests require sharp native binaries
- Deprecated compressor tests may need Java (for YUI)
- Consider `test.skipIf()` for platform-specific tests

---

## Priority Ranking

1. **Compression ratio** - Catches regressions, easy to add
2. **Unicode content** - Common bug source, easy to add
3. **Deprecated smoke tests** - Prevents silent breakage
4. **Cross-platform paths** - Important for Windows users
5. **Everything else** - As needed

---

## Open Questions

1. What compression ratio thresholds are reasonable?
2. Should deprecated compressor tests run in CI or be manual-only?
3. Do we need Windows CI runner for cross-platform tests?

# Integration Tests Plan

## Overview

This document outlines the plan for adding integration tests to node-minify. These tests complement existing unit tests by validating end-to-end workflows, CLI behavior, and realistic usage scenarios.

## Current State

| Coverage Type | Status | Location |
|---------------|--------|----------|
| Unit tests (per compressor) | ✅ Complete | `packages/*/\__tests__/*.test.ts` |
| Shared fixture tests | ✅ Complete | `tests/fixtures.ts` |
| Core validation/errors | ✅ Complete | `packages/core/__tests__/core.test.ts` |
| CLI integration | ⚠️ Partial | `packages/cli/__tests__/cli.test.ts` |
| End-to-end workflows | ❌ Missing | - |
| Examples validation | ❌ Missing | - |

## Proposed Structure

```
tests/
├── fixtures/           # (existing) Test input files
├── fixtures.ts         # (existing) Shared test helpers
├── files-path.ts       # (existing) File path constants
├── integration/        # (new) Integration tests
│   ├── cli.integration.test.ts
│   ├── workflow.integration.test.ts
│   ├── examples.integration.test.ts
│   └── error-scenarios.integration.test.ts
└── tmp/                # (existing) Test output directory
```

---

## Test Suites

### 1. CLI Integration Tests

**File:** `tests/integration/cli.integration.test.ts`

**Purpose:** Validate the CLI works end-to-end as a user would invoke it.

| Test Case | Description |
|-----------|-------------|
| Basic JS minification | `node-minify -c terser -i input.js -o output.js` |
| Basic CSS minification | `node-minify -c clean-css -i input.css -o output.css` |
| Wildcard input | `node-minify -c terser -i "src/**/*.js" -o dist/bundle.js` |
| Multiple files with $1 | `node-minify -c terser -i "*.js" -o "$1.min.js"` |
| Invalid compressor | Should exit with error code and meaningful message |
| Missing input file | Should exit with error code and meaningful message |
| Help flag | `--help` displays usage information |
| Version flag | `--version` displays version |
| Silent mode | `--silent` suppresses output |

**Implementation notes:**
- Use `child_process.exec` or `execa` to run actual CLI commands
- Verify exit codes, stdout/stderr, and output file existence
- Use temp directories for isolation

---

### 2. Workflow Integration Tests

**File:** `tests/integration/workflow.integration.test.ts`

**Purpose:** Test realistic multi-asset build scenarios.

| Test Case | Description |
|-----------|-------------|
| JS + CSS pipeline | Minify JS and CSS in sequence, verify both outputs |
| Parallel compression | Multiple files compressed in parallel, all succeed |
| Partial failure handling | One file fails, others succeed (with `Promise.allSettled` pattern) |
| Source map chain | Generate source map, verify it maps back to original |
| In-memory + file output | Process in-memory, then write result to disk |
| Public folder workflow | Use `publicFolder` option with relative paths |
| Replace in place | `replaceInPlace: true` modifies original files (in temp dir) |

**Implementation notes:**
- Set up realistic directory structures in `tests/tmp/`
- Clean up after each test
- Verify file contents, not just existence

---

### 3. Examples Validation Tests

**File:** `tests/integration/examples.integration.test.ts`

**Purpose:** Ensure documentation examples actually work.

| Test Case | Description |
|-----------|-------------|
| README quick start | The code snippets in README.md work |
| Server example compiles | `examples/server.js` can be loaded without errors |
| Server endpoints work | Hit `/minify` endpoint, verify response |
| All compressor examples | Each compressor's documented usage works |

**Implementation notes:**
- Import examples programmatically where possible
- For server, start it in a child process, make HTTP requests, then kill
- Use port 0 for dynamic port assignment to avoid conflicts

---

### 4. Error Scenario Tests

**File:** `tests/integration/error-scenarios.integration.test.ts`

**Purpose:** Validate graceful error handling in edge cases.

| Test Case | Description |
|-----------|-------------|
| Invalid JavaScript syntax | Compressor receives malformed JS, returns useful error |
| Invalid CSS syntax | Compressor receives malformed CSS, returns useful error |
| Non-existent input file | Clear error message with file path |
| Permission denied (read) | Handles unreadable file gracefully |
| Permission denied (write) | Handles unwritable output path gracefully |
| Empty input file | Handles 0-byte file without crashing |
| Binary file as input | Doesn't corrupt or crash on non-text input |
| Circular symlinks | Handles gracefully when globbing |
| Very large file | Performance doesn't degrade catastrophically (>1MB JS) |

**Implementation notes:**
- Create files with specific permissions using `fs.chmod`
- Skip permission tests on Windows where applicable
- Set timeouts for performance tests

---

## Implementation Plan

### Phase 1: Infrastructure Setup ✅ DONE
- [x] Create `tests/integration/` directory
- [x] Add integration test utilities (temp dir helpers, CLI runner)
- [x] Update `vitest.config.ts` to include integration tests
- [x] Add npm script: `bun run test:integration`

### Phase 2: CLI Tests ✅ DONE
- [x] Implement CLI test runner utility
- [x] Write basic CLI success tests
- [x] Write CLI error handling tests
- [x] Write CLI flag tests (--help, --version, --silent)

### Phase 3: Workflow Tests ✅ DONE
- [x] Implement temp directory fixtures helper
- [x] Write multi-asset pipeline tests
- [x] Write parallel processing tests
- [x] Write source map validation tests

### Phase 4: Examples & Error Tests ✅ DONE
- [x] Write examples validation tests
- [x] Write error scenario tests
- [x] Add performance baseline test

---

## Test Utilities Needed

```typescript
// tests/integration/helpers.ts

/**
 * Run CLI command and capture output
 */
export async function runCLI(args: string[]): Promise<{
    exitCode: number;
    stdout: string;
    stderr: string;
}>;

/**
 * Create isolated temp directory with fixtures
 */
export async function createTempFixtures(files: Record<string, string>): Promise<{
    dir: string;
    cleanup: () => Promise<void>;
}>;

/**
 * Verify minified output is valid
 */
export function assertValidMinifiedJS(content: string): void;
export function assertValidMinifiedCSS(content: string): void;
```

---

## Success Criteria

1. **All integration tests pass** in CI (GitHub Actions)
2. **No flaky tests** - deterministic results across runs
3. **Reasonable execution time** - integration suite completes in <60s
4. **Cross-platform** - tests pass on Linux, macOS, Windows
5. **Isolated** - tests don't interfere with each other or leave artifacts

---

## Open Questions

1. **Should integration tests run on every PR?**
   - Recommendation: Yes, but in a separate CI job to not block unit tests

2. **Should we test deprecated compressors (yui, babel-minify)?**
   - Recommendation: Minimal smoke tests only, not full coverage

3. **Should examples validation test against live HTTP server?**
   - Recommendation: Yes, but with short timeout and in separate process

---

## Timeline Estimate

| Phase | Effort |
|-------|--------|
| Phase 1: Infrastructure | 1-2 hours |
| Phase 2: CLI Tests | 2-3 hours |
| Phase 3: Workflow Tests | 2-3 hours |
| Phase 4: Examples & Errors | 2-3 hours |
| **Total** | **7-11 hours** |

---

## Results

**Completed:** December 31, 2025

| Suite | Tests | File |
|-------|-------|------|
| CLI Integration | 18 | `cli.integration.test.ts` |
| Workflow Integration | 15 | `workflow.integration.test.ts` |
| Error Scenarios | 25 | `error-scenarios.integration.test.ts` |
| Image Compressors | 21 | `image.integration.test.ts` |
| **Total** | **79** | |

**Command:** `bun run test:integration`

---

## Phase 5+ (Future)

See [integration-tests-ideas.md](./integration-tests-ideas.md) for additional test ideas:

### Phase 5: Image Compressors ✅ DONE
- [x] Test sharp: PNG → WebP, PNG → AVIF
- [x] Test svgo: SVG optimization  
- [x] Test imagemin: PNG/JPEG compression

### Phase 6: Edge Cases
- [ ] Unicode content (emoji, CJK, RTL)
- [ ] Compression ratio assertions
- [ ] Deprecated compressor smoke tests

### Phase 7: Platform & Performance
- [ ] Cross-platform path tests (Windows)
- [ ] Memory usage baseline
- [ ] Benchmark suite

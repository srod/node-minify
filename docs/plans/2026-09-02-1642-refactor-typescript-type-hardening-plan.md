---
title: TypeScript Type Hardening - Plan
type: refactor
date: 2026-09-02
topic: typescript-type-hardening
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-brainstorm
execution: code
---

# TypeScript Type Hardening - Plan

## Goal Capsule

- **Objective:** Every explicit `any` and unexplained type suppression is gone from the monorepo, and the toolchain fails the build if one comes back — the `as any` ban stops being a convention and becomes enforced.
- **Means:** Bring test files under `tsc`, convert casts to commented `@ts-expect-error` or real types, enable Biome `noExplicitAny` (KTD1, KD1, KD2).
- **Product authority:** This session's dialogue (2026-09-02) plus AGENTS.md's anti-pattern list, which this work amends.
- **Stop conditions:** Any fix that would require changing runtime behavior or test assertions to satisfy the typechecker — stop and surface it; this pass is types, directives, and config only.
- **Open blockers:** None.

---

## Product Contract

**Product Contract preservation:** unchanged in meaning; Outstanding Questions resolved into KTD1/KTD2 (both were `Deferred to Planning` and planning answered them).

### Summary

Bring all `__tests__` files under `tsc` typecheck, replace every deliberate invalid-input cast with a commented `@ts-expect-error` directive, give mocks and fixtures real types where one exists, then enable Biome's `noExplicitAny` across the whole repo so regressions are caught mechanically. Shipped `src/` code is already strict and clean except one narrow case: `packages/google-closure-compiler/src/index.ts` has implicit-any parameters that only surface when another package's program compiles it (see U3).

### Problem Frame

AGENTS.md bans `as any`, `@ts-ignore`, and `@ts-expect-error`, but nothing enforces the ban: Biome's `noExplicitAny` rule is off, and every package's tsconfig includes only `src/**/*`, so test files are never typechecked at all. The result is ~147 `as any` sites, ~40 `as unknown as T` double-casts, and ~5 bare `@ts-expect-error` directives — all in test files, accumulated invisibly because no tool ever looked. Most casts are legitimate in intent (tests deliberately passing invalid input to exercise runtime validation) but illegitimate in form: an unchecked cast can silently rot into passing valid input, at which point the test verifies nothing.

### Key Decisions

- KD1. **Commented `@ts-expect-error` replaces invalid-input casts in tests.** (session-settled: user-directed — chosen over a centralized `invalid<T>()` cast helper and inline `as unknown as T`: the directive is compiler-verified, so the build fails if the type error it suppresses ever stops existing — it cannot rot.) Governs R4, R5.
- KD2. **`noExplicitAny` enforced everywhere, tests included.** (session-settled: user-directed — chosen over src-only enforcement or convention-only: all current debt lives in tests, so exempting them would let it re-accumulate.) Governs R8.
- KD3. **Test files enter typecheck coverage.** (session-settled: user-approved — forced consequence of KD1: `@ts-expect-error` only self-verifies in a file the compiler checks; in an unchecked file the directive is dead ink.) Governs R1, R2, R3.
- KD4. **Scope includes `as unknown as T` double-casts and bare directives, not just `as any`.** (session-settled: user-approved — same debt in different spelling; a pass that leaves them behind re-opens the same cleanup later.) Governs R6, R7.

### Requirements

**Typecheck coverage**

- R1. Every package's `__tests__` directory and the shared `tests/` helpers (`tests/fixtures.ts`, `tests/files-path.ts`) are typechecked by `bun run typecheck`.
- R2. The two packages that explicitly exclude `__tests__` in their tsconfig (`packages/imagemin`, `packages/svgo`) are unified with the inclusion mechanism the other 20 packages adopt — no per-package divergence remains.
- R3. `bun run typecheck` passes clean across all packages, tests included, and runs in CI on the same trigger it does today. `packages/types` gains a minimal tsconfig and `typecheck` script so its `types.d.ts` — the type surface every package imports — is checked directly rather than only through downstream compile errors.

**Cast elimination**

- R4. No `as any` remains anywhere in the repo. Casts that deliberately pass invalid input to exercise runtime validation become `@ts-expect-error` directives; each directive carries a comment stating what invalid condition it suppresses.
- R5. The existing bare `@ts-expect-error` directives (`packages/sharp/__tests__/sharp.test.ts`, `packages/utils/__tests__/utils.test.ts`) gain the same required comment.
- R6. No `as unknown as T` double-cast remains. Each is either replaced by a commented `@ts-expect-error` (when testing invalid input) or by a real type (when the cast papers over a fixable mock or fixture type).
- R7. Shared test fixtures are properly typed: `tests/fixtures.ts` types `compressor` as the `Compressor` type from `@node-minify/types` instead of `any`, and its error-code narrowing uses a typed guard instead of `as any`.

**Enforcement**

- R8. Biome's `suspicious.noExplicitAny` is enabled with no override exempting tests, and `bun run lint` passes clean.
- R9. AGENTS.md's anti-pattern list is amended: the blanket ban stays for `src/`; `@ts-expect-error` with a required explanation comment becomes the sanctioned pattern for invalid-input tests. `@ts-ignore` stays banned everywhere.

### Acceptance Examples

- AE1. **Covers R4.** Given a test passing `{ settings: {} as any, content: "..." }` to a compressor to verify its runtime validation, when the pass lands, then the cast is gone and the line above carries `@ts-expect-error` plus a comment naming the deliberately-missing settings fields.
- AE2. **Covers R1, KD3.** Given a future contributor fixes a compressor's signature so a previously-invalid test input becomes valid, when they run `bun run typecheck`, then the now-unused `@ts-expect-error` fails the check — the stale suppression cannot survive silently.
- AE3. **Covers R8.** Given a future PR introduces `as any` in any file, src or test, when CI runs `bun run lint`, then Biome fails the build.
- AE4. **Covers R6.** Given a mock like `{ paginate, rest: {...} } as unknown as ReturnType<typeof getOctokit>` that exists only because the mock object is partially shaped, when a real partial-mock type (or a commented directive) can express the same intent, then the double-cast is replaced accordingly — no double-cast survives on convenience alone.

### Scope Boundaries

- No behavioral changes to any package — this pass changes types, directives, and config only; test assertions and runtime logic stay as they are.
- No new strictness flags beyond what the total-typescript base already provides (`strict`, `noUncheckedIndexedAccess`, `noImplicitOverride` are already on).
- No cleanup of `docs/` (separate Astro site) — scanned clean of explicit `any`, so repo-wide enforcement lands there with zero code changes.
- No changeset — internal refactor with no user-facing package changes, unless typecheck fixes force a published-type correction.

### Success Criteria

- `bun run ci` (build, lint, typecheck, test) passes end-to-end with tests under typecheck and `noExplicitAny` on.
- Grepping the repo for `as any` and `as unknown as` returns zero matches; every `@ts-expect-error` has an adjacent explanation comment.

---

## Planning Contract

### Key Technical Decisions

- KTD1. **Per-package tsconfig `include` widening, not a root `tsconfig.tests.json`.** (session-settled: user-approved — chosen over a root-level test tsconfig: no new files, no CI wiring, reuses each package's existing `tsc --noEmit` script.) Widening `include` alone fails: `rootDir: "./src"` rejects test files with `TS6059` regardless of `noEmit` (verified by live repro in `packages/core` and `packages/clean-css`), so the `rootDir` override is removed from all 22 package tsconfigs alongside the widening — harmless under `noEmit: true` since declaration emit runs through tsdown, which derives its own paths. Cross-package test imports (`../../<pkg>/src/index.ts`, `../../../tests/*.ts`) resolve via existing relative paths and `node_modules/@node-minify/*` workspace symlinks. Implements KD3; governs R1, R2.
- KTD2. **Plain `tsc --noEmit` performs the test typecheck, not Vitest's typecheck mode.** The per-package `typecheck` script already exists and CI already runs it (`bun run ci` → `bun run --filter '*' typecheck`); Vitest typecheck would add a second, parallel mechanism for the same guarantee. Governs R3.
- KTD3. **Delete `tests/tsconfig.json`.** (session-settled: user-approved — surfaced as a call-out: once packages typecheck their tests directly, the orphaned config with its stale `paths` mapping to `packages/types/src/types.d.ts` misleads; nothing consumes it.)
- KTD4. **Config-first sequencing within a single PR.** Widen typecheck coverage first (U2), then fix the errors it reveals area by area. An `@ts-expect-error` directive can only be verified correct in a checked file, so adding directives before coverage would be blind work. `bun run typecheck` is red between U2 and U5 — acceptable inside one branch, never merged red.

### Assumptions

- The exact count of type errors revealed by widening coverage will exceed the grep-visible cast count (casts were added where errors were *noticed*, not everywhere they exist). The fix categories stay the same; volume may grow.

---

## Implementation Units

### U1. Type the shared test fixtures

- **Goal:** `tests/fixtures.ts` and `tests/files-path.ts` compile clean with real types, since every package's tests import them.
- **Requirements:** R7, R1.
- **Dependencies:** None.
- **Files:** `tests/fixtures.ts`, `tests/files-path.ts`.
- **Approach:**
  1. Type `TestOptions.compressor` and the `setCompressor` parameter as `Compressor` from `@node-minify/types` (import via the workspace package, matching how package tests import it).
  2. Replace the `(error as any).code` narrowing (lines ~185-187) with a typed guard: narrow `error` via `in`-checks to an object with a `string` `code` property — no cast.
- **Patterns to follow:** `packages/core/__tests__/core.test.ts` imports `type { Compressor, Settings } from "@node-minify/types"` — same import shape.
- **Test scenarios:** Test expectation: none — pure typing change to shared helpers; the existing full suite (`bun run test`) passing unchanged is the behavioral proof.
- **Verification:** `bun run test` passes; no `any` remains in `tests/*.ts`.

### U2. Bring test files under typecheck

- **Goal:** All 22 package tsconfigs typecheck `__tests__/**/*`; `packages/types` enters the typecheck gate; the orphaned test tsconfig is gone.
- **Requirements:** R1, R2, R3. Implements KTD1, KTD2, KTD3.
- **Dependencies:** U1.
- **Files:** `packages/*/tsconfig.json` (all 22), `packages/types/tsconfig.json` (create), `packages/types/package.json`, `tests/tsconfig.json` (delete).
- **Approach:**
  1. Widen every package's `include` to `["src/**/*", "__tests__/**/*"]` and remove the `rootDir: "./src"` override (per KTD1 — `rootDir` rejects test files with `TS6059` regardless of `noEmit`; tsdown derives build paths independently).
  2. Remove the `"exclude": [..., "__tests__"]` entries in `packages/imagemin/tsconfig.json` and `packages/svgo/tsconfig.json` (per R2).
  3. Add a minimal `packages/types/tsconfig.json` (extends root, includes `src/**/*`) and a `"typecheck": "tsc --noEmit"` script to `packages/types/package.json` so the `--filter '*'` loop picks it up (per R3).
  4. Delete `tests/tsconfig.json` (KTD3). Shared `tests/*.ts` helpers are checked transitively through package-test imports.
- **Execution note:** `bun run typecheck` goes red here and stays red until U5 lands — that is the expected state inside this branch (KTD4). Capture the initial error inventory per package to drive U3-U5.
- **Test scenarios:** Test expectation: none — config-only unit; proof is typecheck coverage observable via deliberate error (see Verification).
- **Verification:** `tsc --noEmit` in any package now reports errors from its `__tests__` files (coverage proof); a scratch `as any`-shaped type error added to a test file is reported and then removed; `bun run typecheck` now emits 23 per-package result lines including `@node-minify/types`; `bun run build && bun run check-exports` still passes after the `rootDir` removal (attw reads published `dist/` output).

### U3. Convert casts in utils and core tests

- **Goal:** The two heaviest test suites compile clean under the new coverage.
- **Requirements:** R4, R5, R6. Governed by KD1, KD4.
- **Dependencies:** U2.
- **Files:** `packages/utils/__tests__/utils.test.ts` (~54 `as any`, 3 `as unknown as string`, 1 bare directive area), `packages/utils/__tests__/getContentFromFilesAsync.test.ts`, `packages/utils/__tests__/setPublicFolder.test.ts`, `packages/core/__tests__/core.test.ts`, `packages/core/__tests__/compress_async.test.ts`, `packages/core/__tests__/compress-paths.test.ts`, `packages/core/__tests__/setup.test.ts`, `packages/google-closure-compiler/src/index.ts` (implicit-any params, cross-package visibility).
- **Approach:**
  1. Invalid-input casts (`null as any`, `123 as any`, `{} as any` settings, `undefined as unknown as string`) → `@ts-expect-error` + comment naming the invalid condition, per AE1.
  2. Partial-but-valid settings objects (`{ compressor, input, output } as any` where the object is legitimately shaped but incomplete) → prefer typing as `Settings` with only optional fields omitted; fall back to `@ts-expect-error` when the omission *is* the test.
  3. `"fake" as unknown as Compressor`-style casts (core.test.ts:35,108,161) and `setup.test.ts:18` → `@ts-expect-error` + comment (a string is deliberately not a `Compressor`).
  4. Cross-package src imports entering core's program (`core.test.ts` imports `../../google-closure-compiler/src/index.ts`): gcc's ambient `declare module` in `packages/google-closure-compiler/src/types.d.ts` is invisible to core's compile, surfacing 5 errors (`TS7016` + 4 implicit-any `TS7006`). Fix gcc's `src/index.ts` implicit-any parameters with real types so the file typechecks in any including program; apply the same treatment to any other cross-package src import U2's error inventory reveals.
- **Patterns to follow:** `packages/utils/__tests__/setPublicFolder.test.ts:7` — `// @ts-expect-error testing invalid input` is the existing in-repo model; extend its comment style with the specific condition.
- **Test scenarios:**
  - All existing utils and core tests pass unchanged (`bun run test packages/utils packages/core`) — assertions untouched.
  - Each added directive suppresses a real error: `tsc --noEmit` in both packages is clean, proving no directive is unused (unused `@ts-expect-error` is itself an error).
- **Verification:** `tsc --noEmit` clean in `packages/utils` and `packages/core`; zero `as any` / `as unknown as` matches in both `__tests__` directories.

### U4. Convert casts in compressor package tests

- **Goal:** The small per-compressor error-path tests compile clean.
- **Requirements:** R4, R5, R6.
- **Dependencies:** U2. Can proceed in parallel with U3.
- **Files:** `__tests__` files in `packages/{clean-css,cssnano,csso,html-minifier,jsonminify,minify-html,no-compress,oxc,terser,sharp,imagemin,google-closure-compiler}`.
- **Approach:**
  1. The repeated `{ settings: {} as any, content: ... }` pattern (~15 sites) → `@ts-expect-error` + comment (`settings` deliberately missing required fields); one consistent comment phrasing across all compressor tests.
  2. `"not a buffer" as unknown as Buffer` (sharp, imagemin) → `@ts-expect-error` + comment.
  3. The 4 bare `@ts-expect-error` in `packages/sharp/__tests__/sharp.test.ts` (mock implementations narrower than sharp's type) → add reason comments (R5); if the suppressed error no longer exists under checking, delete the directive instead.
  4. `mock.onRun?.(child as unknown as FakeChild, ...)` (google-closure-compiler) → give the fake child a real type or a commented directive, per AE4.
- **Test scenarios:**
  - All compressor package tests pass unchanged.
  - `tsc --noEmit` clean in each touched package (proves every directive is live).
- **Verification:** Zero cast matches across all compressor `__tests__` directories; per-package typecheck clean.

### U5. Convert casts in action, cli, and benchmark tests

- **Goal:** The mock-heavy suites compile clean; octokit mocks get a real partial-mock shape.
- **Requirements:** R3, R4, R6. AE4 is decided here.
- **Dependencies:** U2. Can proceed in parallel with U3/U4.
- **Files:** `packages/action/__tests__/{index,minify,runAutoMode,runExplicitMode,comment,compare}.test.ts`, `packages/cli/__tests__/{cli,spinner}.test.ts`, `packages/benchmark/__tests__/coverage.test.ts`.
- **Approach:**
  1. `vi.mocked(stat).mockResolvedValue({ size: N } as any)` (~15 sites) → type the partial as the minimal `Stats` shape the code under test reads; if `vi.mocked`'s signature rejects partials, a commented `@ts-expect-error` naming the partial-mock intent.
  2. `as unknown as ReturnType<typeof getOctokit>` (~15 sites in comment/compare tests) → extract one typed helper per test file (e.g., a function returning the partial mock with a single documented cast or directive at its definition) so the suppression exists once per file, not 15 times — per AE4, no per-site double-cast survives.
  3. `(context as any).payload = {...}` → type via the actual `@actions/github` context type's writable shape, or one commented directive.
  4. Invalid-input casts (`"invalid-compressor" as any`, `null as any` input) → `@ts-expect-error` + comment, per AE1.
- **Patterns to follow:** `packages/action/__tests__/comment.test.ts:50-53` already centralizes the octokit mock in a helper — extend that helper rather than inventing a new structure.
- **Test scenarios:**
  - All action, cli, and benchmark tests pass unchanged.
  - The octokit mock helper is the only suppression site for octokit shapes — grep confirms no inline `as unknown as ReturnType` remains.
  - `tsc --noEmit` clean in all three packages.
- **Verification:** Zero cast matches in the three packages' `__tests__`; `bun run typecheck` now green repo-wide (first green since U2).

### U6. Enable lint enforcement and amend AGENTS.md

- **Goal:** Regressions are caught mechanically and the documented convention matches the enforced one.
- **Requirements:** R8, R9. Implements KD2.
- **Dependencies:** U3, U4, U5 (lint can only flip once the repo is clean).
- **Files:** `biome.json`, `AGENTS.md`.
- **Approach:**
  1. Remove `"noExplicitAny": "off"` from `biome.json` (recommended set enables it) — no test override (KD2).
  2. Amend the root AGENTS.md anti-patterns: `as any` banned everywhere; `@ts-ignore` banned everywhere; `@ts-expect-error` banned in `src/`, sanctioned in test files only with a mandatory reason comment.
  3. Run `bun run lint` and verify zero additional `any` sites exist beyond the files U1/U3-U5 enumerate — repo greps already confirm none, so this is a verification step, not open-ended fix work.
- **Test scenarios:** Test expectation: none — config and docs unit; the lint run itself is the proof (see Verification, AE3).
- **Verification:** `bun run lint` clean; a scratch `as any` added to any file fails lint and is removed (AE3 proof).

---

## Verification Contract

| Check | Command | Proves |
|---|---|---|
| Typecheck (tests included) | `bun run typecheck` | R1, R2, R3; every `@ts-expect-error` is live (AE2) |
| Lint | `bun run lint` | R8 (AE3) |
| Full test suite | `bun run test` | Behavior preserved — zero assertion changes |
| Build + exports | `bun run build && bun run check-exports` | Published type surfaces unaffected |
| Full gate | `bun run ci` | Success criteria end-to-end |
| Cast grep | grep for `as any` and `as unknown as` across all source roots (`packages/`, `tests/`, `scripts/`, `examples/`, `docs/src/`) | R4, R6 — zero matches |

---

## Definition of Done

- All six units landed; `bun run ci` green.
- Zero `as any` / `as unknown as T` in the repo; every `@ts-expect-error` carries a reason comment and suppresses a live error.
- `biome.json` enforces `noExplicitAny` with no test exemption; AGENTS.md documents the amended convention.
- `tests/tsconfig.json` deleted; no orphaned or divergent tsconfig remains.
- No test assertion, runtime logic, or published API changed; no scratch/probe edits (U2, U6 verification probes) left in the diff.

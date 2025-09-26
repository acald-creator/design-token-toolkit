# Copilot Instructions

## Project snapshot
- ReScript 11.1.4 project with `@rescript/core` pre-opened via `-open RescriptCore` (see `rescript.json`).
- Source lives in `src/`, and the compiler writes sibling `*.res.mjs` files because `package-specs.in-source` is enabled—treat the generated JS as build artifacts.
- Current entry point `src/Demo.res` demonstrates console logging; extend or replace it with real modules for the design-token tooling you add.

## Build + iteration flow
- Install deps with `bun install`; the repo tracks `bun.lock` alongside `package.json`.
- One-off build: `bun run res:build` (invokes the ReScript compiler and emits ES modules).
- Continuous rebuild: `bun run res:dev` for watch mode during development.
- Clean stale outputs with `bun run res:clean` before diagnosing strange compiler state.
- Execute the compiled entry point via Bun's Node shim: `bun run node src/Demo.res.mjs` (runtime code should come from the generated `.mjs`).

## Coding patterns that matter here
- Keep new ReScript modules under `src/`; subdirectories are auto-resolved because `sources` enables `subdirs` in `rescript.json`.
- Re-export helpers from an index module when you want a stable public surface—ReScript consumers will import from the generated `.mjs`.
- Favor `@rescript/core` utilities (e.g., `Array`, `Option`) instead of JS interop; the core library is globally opened, so use `Option.getWithDefault` rather than `RescriptCore.Option`.
- For Node interop, declare bindings with `@module`, `@new`, etc., and place them near usage; the codebase currently relies solely on `Console.log`, so document any new externals you add.
- Resist editing `.res.mjs` outputs directly—always change the `.res` source and rebuild.

## Adding features safely
- New CLIs or scripts should expose an explicit `main` function in ReScript and call it at module end; the generated `.mjs` stays concise for Bun/Node.
- When introducing async work, use `Js.Promise` from `@rescript/core` and remember Node awaits nothing automatically—chain promises or call `Js.Promise.thenResolve`.
- If you need configuration, add strongly typed records in ReScript and parse JSON via `Js.Json`; keep parsing helpers in their own module for reuse.
- Commit both `.res` and generated `.res.mjs` files—this template tracks compiled output.

## Quick sanity checklist before PRs
- Build once with `bun run res:build` to ensure the compiler is happy.
- Run the relevant generated `.mjs` scripts using `bun run node <file>` to confirm runtime behavior; add sample invocations in the PR description when introducing new entry points.
- Verify that any new modules are imported somewhere reachable; unused modules will still compile but can hide dead code.
